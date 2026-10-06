/**
 * Real-time effects chain for the Refinement Studio.
 *
 * Every control is 0..100 with 50 as neutral (the untouched sound):
 *   intensity  – output level, -12 dB .. +6 dB into a safety limiter
 *   tone       – tilt EQ: dark (more lows / fewer highs) ↔ bright
 *   texture    – clean (gentle low-pass smoothing) ↔ gritty (tanh saturation)
 *   brightness – warm (low-mid body) ↔ airy (high-shelf "air")
 *   dynamics   – flat (heavy fast compression) ↔ punchy (transient shaper boosting attacks)
 *   spatial    – close (narrowed toward mono) ↔ vast (wider + reverb)
 *
 * Signal flow:
 *   source → smooth LPF → tone shelves → warmth/air → saturator → transient shaper
 *          → compressor → auto-gain → stereo width → (dry + reverb) → intensity → limiter → out
 *
 * The auto-gain stage slowly matches the processed level to the input level, so
 * the character controls change how a sound feels rather than how loud it is
 * (otherwise compression/saturation swing the level by ±15 dB depending on the
 * material). Intensity sits after it and is the only control meant to change level.
 *
 * Saturation drive and compressor threshold are set relative to the measured
 * input level, so Texture and Dynamics act the same on a quiet piano as on a
 * loud ambience.
 */

export type FxValues = Record<string, number>;

const SMOOTH = 0.03; // seconds — time constant for parameter changes, avoids zipper noise
const AUTO_GAIN_INTERVAL = 50; // ms between loudness measurements
const AUTO_GAIN_EMA = 0.08; // per-measurement smoothing, ~0.6 s to settle
const INPUT_LEVEL_EMA = 0.05; // slower: drives saturation/compression settings
const SILENCE_DB = -60;
const DRIVE_TARGET_DB = -12; // RMS level the saturator is driven at
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const rmsDb = (buf: Float32Array) => {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
  return 10 * Math.log10(sum / buf.length + 1e-12);
};

const bipolar = (v: number | undefined) => (Math.min(100, Math.max(0, v ?? 50)) - 50) / 50; // -1..1
const dbToGain = (db: number) => Math.pow(10, db / 20);

function saturationCurve(drive: number) {
  const n = 2048;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    // drive 1 → identity; higher drive pushes harder into tanh clipping.
    // Dividing by sqrt(drive) roughly holds perceived loudness steady.
    curve[i] = drive <= 1 ? x : Math.tanh(drive * x) / Math.sqrt(drive);
  }
  return curve;
}

// Transient-shaper gain law: input is the scaled (fast − slow) envelope, output is
// added to a VCA's base gain of 1 → attacks up to +10 dB, tails down to −4 dB.
function transientCurve() {
  const n = 1025; // odd so x = 0 maps exactly to 0 (unity gain when idle)
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = x > 0 ? 2.2 * x : 0.37 * x;
  }
  return curve;
}

function rectifierCurve() {
  const n = 1025;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) curve[i] = Math.abs((i / (n - 1)) * 2 - 1);
  return curve;
}

function reverbImpulse(ctx: BaseAudioContext, seconds = 3.2, decay = 2.6): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return ir;
}

export class AudioFxChain {
  readonly ctx: AudioContext;
  private source: MediaElementAudioSourceNode;
  private smooth: BiquadFilterNode;
  private toneLow: BiquadFilterNode;
  private toneHigh: BiquadFilterNode;
  private warmth: BiquadFilterNode;
  private air: BiquadFilterNode;
  private driveIn: GainNode;
  private shaper: WaveShaperNode;
  private driveOut: GainNode;
  private transientVca: GainNode;
  private transientAmount: GainNode;
  private comp: DynamicsCompressorNode;
  private autoGain: GainNode;
  private autoGainDb = 0;
  private autoGainTimer: ReturnType<typeof setInterval>;
  private ll: GainNode;
  private lr: GainNode;
  private rl: GainNode;
  private rr: GainNode;
  private dry: GainNode;
  private wet: GainNode;
  private output: GainNode;
  private lastDrive = -1;
  private values: FxValues = {};
  private inputDb = -20;

  constructor(audio: HTMLMediaElement) {
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.source = ctx.createMediaElementSource(audio);

    this.smooth = new BiquadFilterNode(ctx, { type: "lowpass", frequency: 20000, Q: 0.5 });
    this.toneLow = new BiquadFilterNode(ctx, { type: "lowshelf", frequency: 250 });
    this.toneHigh = new BiquadFilterNode(ctx, { type: "highshelf", frequency: 2500 });
    this.warmth = new BiquadFilterNode(ctx, { type: "peaking", frequency: 300, Q: 0.8 });
    this.air = new BiquadFilterNode(ctx, { type: "highshelf", frequency: 9000 });
    this.driveIn = new GainNode(ctx);
    this.shaper = new WaveShaperNode(ctx, { oversample: "2x" });
    this.driveOut = new GainNode(ctx);
    this.comp = new DynamicsCompressorNode(ctx, { threshold: 0, ratio: 1, knee: 6 });

    // Transient shaper: envelope follower (rectify → fast & slow low-pass); their
    // difference is positive on attacks, negative on decays, and modulates a VCA.
    // A short delay on the audio path lets the envelope catch the attack.
    const lookahead = new DelayNode(ctx, { delayTime: 0.005 });
    this.transientVca = new GainNode(ctx, { gain: 1 });
    const rectify = new WaveShaperNode(ctx, { curve: rectifierCurve() });
    const fastEnv1 = new BiquadFilterNode(ctx, { type: "lowpass", frequency: 40, Q: 0.5 });
    const fastEnv2 = new BiquadFilterNode(ctx, { type: "lowpass", frequency: 40, Q: 0.5 });
    const slowEnv = new BiquadFilterNode(ctx, { type: "lowpass", frequency: 4, Q: 0.5 });
    const invertSlow = new GainNode(ctx, { gain: -1 });
    this.transientAmount = new GainNode(ctx, { gain: 0 });
    const transientLaw = new WaveShaperNode(ctx, { curve: transientCurve() });
    this.autoGain = new GainNode(ctx);

    // Stereo width matrix. Upmix to 2 channels first so mono files still work.
    const widthIn = new GainNode(ctx, {
      channelCount: 2,
      channelCountMode: "explicit",
      channelInterpretation: "speakers",
    });
    const split = new ChannelSplitterNode(ctx, { numberOfOutputs: 2 });
    const merge = new ChannelMergerNode(ctx, { numberOfInputs: 2 });
    this.ll = new GainNode(ctx);
    this.lr = new GainNode(ctx);
    this.rl = new GainNode(ctx);
    this.rr = new GainNode(ctx);

    this.dry = new GainNode(ctx);
    this.wet = new GainNode(ctx, { gain: 0 });
    const reverb = new ConvolverNode(ctx, { buffer: reverbImpulse(ctx) });
    const damping = new BiquadFilterNode(ctx, { type: "lowpass", frequency: 4500, Q: 0.5 });

    this.output = new GainNode(ctx);
    const limiter = new DynamicsCompressorNode(ctx, {
      threshold: -1,
      knee: 0,
      ratio: 20,
      attack: 0.002,
      release: 0.1,
    });

    this.source
      .connect(this.smooth)
      .connect(this.toneLow)
      .connect(this.toneHigh)
      .connect(this.warmth)
      .connect(this.air)
      .connect(this.driveIn)
      .connect(this.shaper)
      .connect(this.driveOut)
      .connect(lookahead)
      .connect(this.transientVca)
      .connect(this.comp)
      .connect(this.autoGain)
      .connect(widthIn)
      .connect(split);
    split.connect(this.ll, 0).connect(merge, 0, 0);
    split.connect(this.lr, 0).connect(merge, 0, 1);
    split.connect(this.rl, 1).connect(merge, 0, 0);
    split.connect(this.rr, 1).connect(merge, 0, 1);
    merge.connect(this.dry).connect(this.output);
    merge.connect(reverb).connect(damping).connect(this.wet).connect(this.output);
    this.output.connect(limiter).connect(ctx.destination);

    this.driveOut.connect(rectify);
    rectify.connect(fastEnv1).connect(fastEnv2).connect(this.transientAmount);
    rectify.connect(slowEnv).connect(invertSlow).connect(this.transientAmount);
    this.transientAmount.connect(transientLaw).connect(this.transientVca.gain);

    // Level tracking: compare input vs. processed level before auto-gain
    const preTap = new AnalyserNode(ctx, { fftSize: 2048 });
    const postTap = new AnalyserNode(ctx, { fftSize: 2048 });
    this.source.connect(preTap);
    this.comp.connect(postTap);
    const pre = new Float32Array(preTap.fftSize);
    const post = new Float32Array(postTap.fftSize);
    this.autoGainTimer = setInterval(() => {
      if (ctx.state !== "running" || audio.paused) return;
      preTap.getFloatTimeDomainData(pre);
      postTap.getFloatTimeDomainData(post);
      const inDb = rmsDb(pre);
      const outDb = rmsDb(post);
      if (inDb < SILENCE_DB || outDb < SILENCE_DB) return;
      this.inputDb += (inDb - this.inputDb) * INPUT_LEVEL_EMA;
      this.applyLevelDependent(SMOOTH * 5);
      const target = clamp(inDb - outDb, -24, 24);
      this.autoGainDb += (target - this.autoGainDb) * AUTO_GAIN_EMA;
      this.autoGain.gain.setTargetAtTime(dbToGain(this.autoGainDb), ctx.currentTime, 0.1);
    }, AUTO_GAIN_INTERVAL);
  }

  async resume() {
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  update(values: FxValues) {
    this.values = values;
    const t = this.ctx.currentTime;
    const set = (p: AudioParam, v: number) => p.setTargetAtTime(v, t, SMOOTH);

    // Intensity: -12 dB at 0, unity at 50, +6 dB at 100
    const intensity = bipolar(values.intensity);
    set(this.output.gain, dbToGain(intensity < 0 ? intensity * 12 : intensity * 6));

    // Tone: tilt around ~800 Hz
    const tone = bipolar(values.tone);
    set(this.toneLow.gain, -tone * 10);
    set(this.toneHigh.gain, tone * 10);

    // Texture: below 50 smooths the top end, above 50 saturates
    const texture = bipolar(values.texture);
    const cutoff = texture < 0 ? 20000 * Math.pow(3000 / 20000, -texture) : 20000;
    set(this.smooth.frequency, cutoff);
    const drive = texture > 0 ? 1 + texture * 11 : 1;
    if (Math.abs(drive - this.lastDrive) > 0.01) {
      this.shaper.curve = saturationCurve(drive);
      this.lastDrive = drive;
    }

    // Brightness: warm body vs. airy highs
    const brightness = bipolar(values.brightness);
    set(this.warmth.gain, -brightness * 6);
    set(this.air.gain, brightness * 12);

    // Dynamics: flat = fast, heavy compression; punchy = transient shaper
    // (threshold and shaper depth follow the input level, see applyLevelDependent)
    const dyn = bipolar(values.dynamics);
    set(this.comp.ratio, dyn < 0 ? 1 - dyn * 11 : 1);
    set(this.comp.attack, 0.001);
    set(this.comp.release, 0.3);

    this.applyLevelDependent(SMOOTH);

    // Spatial: close narrows toward mono; vast widens and adds reverb
    const spatial = bipolar(values.spatial);
    const width = spatial < 0 ? 1 + spatial : 1 + spatial * 0.4;
    const same = (1 + width) / 2;
    const cross = (1 - width) / 2;
    set(this.ll.gain, same);
    set(this.rr.gain, same);
    set(this.lr.gain, cross);
    set(this.rl.gain, cross);
    const wet = Math.max(0, spatial);
    set(this.wet.gain, wet * 0.7);
    set(this.dry.gain, 1 - wet * 0.15);
  }

  /** Settings that follow the measured input level. */
  private applyLevelDependent(timeConstant: number) {
    const t = this.ctx.currentTime;
    const set = (p: AudioParam, v: number) => p.setTargetAtTime(v, t, timeConstant);

    // Push the signal to a fixed level into the saturator, then undo it after
    const texture = bipolar(this.values.texture);
    // (ramped in over the first half of the gritty range so it doesn't jump)
    const driveDb =
      texture > 0 ? clamp(DRIVE_TARGET_DB - this.inputDb, -12, 30) * Math.min(1, texture * 2) : 0;
    set(this.driveIn.gain, dbToGain(driveDb));
    set(this.driveOut.gain, dbToGain(-driveDb));

    // Compressor threshold sits below the material's own average level; the
    // transient shaper's depth is normalised by it (envelope / level).
    const dyn = bipolar(this.values.dynamics);
    const threshold = dyn < 0 ? this.inputDb + dyn * 14 : 0;
    set(this.comp.threshold, clamp(threshold, -80, 0));
    set(this.transientAmount.gain, dyn > 0 ? (dyn * 1.5) / dbToGain(this.inputDb) : 0);
  }

  close() {
    clearInterval(this.autoGainTimer);
    this.source.disconnect();
    void this.ctx.close();
  }
}
