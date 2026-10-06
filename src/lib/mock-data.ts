export type MockSound = {
  id: string;
  title: string;
  prompt: string;
  mood: string;
  category: string;
  tags: string[];
  duration: string;
  audioUrl: string;
  waveform: number[];
  favorite?: boolean;
};

export type MockProject = {
  id: string;
  name: string;
  description: string;
  productionType: string;
  createdAt: string;
  soundCount: number;
  updatedAt: string;
  cover: string;
  soundIds: string[];
};


// Deterministic pseudo-waveform generator
export function makeWaveform(seed: number, len = 64): number[] {
  const out: number[] = [];
  let x = seed;
  for (let i = 0; i < len; i++) {
    x = (x * 9301 + 49297) % 233280;
    const v = x / 233280;
    // shape: envelope + noise
    const env = Math.sin((i / len) * Math.PI);
    out.push(0.15 + env * 0.7 * (0.5 + v * 0.5));
  }
  return out;
}

// Local audio files served from public/audio/sounds
const AUDIO_BASE = "/audio/sounds";

export const MOCK_SOUNDS: MockSound[] = [
  {
    id: "snd_1",
    title: "Dark Dungeon Ambience",
    prompt: "Dark dungeon ambience with distant echoing drips",
    mood: "Mysterious",
    category: "Ambience",
    tags: ["dungeon", "dark", "echo", "fantasy"],
    duration: "1:28",
    audioUrl: `${AUDIO_BASE}/dark-dungeon-ambience.wav`,
    waveform: makeWaveform(11),
  },
  {
    id: "snd_2",
    title: "Sci-Fi Corridor Hum",
    prompt: "Sci-fi corridor with low hum and mechanical resonance",
    mood: "Tense",
    category: "Ambience",
    tags: ["sci-fi", "corridor", "hum"],
    duration: "0:39",
    audioUrl: `${AUDIO_BASE}/sci-fi-corridor-hum.wav`,
    waveform: makeWaveform(22),
  },
  {
    id: "snd_3",
    title: "Fantasy Forest Morning",
    prompt: "Fantasy forest with soft wind and distant birds",
    mood: "Peaceful",
    category: "Nature",
    tags: ["forest", "birds", "fantasy"],
    duration: "1:46",
    audioUrl: `${AUDIO_BASE}/fantasy-forest-morning.mp3`,
    waveform: makeWaveform(33),
  },
  {
    id: "snd_4",
    title: "Cinematic Impact",
    prompt: "Cinematic trailer impact with sub boom",
    mood: "Epic",
    category: "Impact",
    tags: ["cinematic", "impact", "trailer"],
    duration: "0:07",
    audioUrl: `${AUDIO_BASE}/cinematic-impact.wav`,
    waveform: makeWaveform(44),
    favorite: true,
  },
  {
    id: "snd_5",
    title: "Horror Atmosphere",
    prompt: "Slow horror drone with dissonant textures",
    mood: "Ominous",
    category: "Ambience",
    tags: ["horror", "drone", "tension"],
    duration: "0:10",
    audioUrl: `${AUDIO_BASE}/horror-atmosphere.wav`,
    waveform: makeWaveform(55),
  },
  {
    id: "snd_6",
    title: "Magic Spell Sparkle",
    prompt: "Magic spell with shimmering sparkle tail",
    mood: "Whimsical",
    category: "SFX",
    tags: ["magic", "sparkle", "fantasy"],
    duration: "0:09",
    audioUrl: `${AUDIO_BASE}/magic-spell-sparkle.wav`,
    waveform: makeWaveform(66),
    favorite: true,
  },
  {
    id: "snd_7",
    title: "Emotional Piano Motif",
    prompt: "Emotional solo piano with soft reverb",
    mood: "Melancholic",
    category: "Music",
    tags: ["piano", "emotional", "cinematic"],
    duration: "1:17",
    audioUrl: `${AUDIO_BASE}/emotional-piano-motif.wav`,
    waveform: makeWaveform(77),
  },
  {
    id: "snd_8",
    title: "Cinematic Transition Whoosh",
    prompt: "Cinematic transition whoosh with rising tail",
    mood: "Energetic",
    category: "Transition",
    tags: ["whoosh", "transition"],
    duration: "0:09",
    audioUrl: `${AUDIO_BASE}/cinematic-transition-whoosh.wav`,
    waveform: makeWaveform(88),
  },
];

// Sounds saved to Firestore before the local files existed still carry old
// remote URLs. Map them back to the matching local file by title, or by tags
// (generated takes keep their source sound's tags but get a new title).
export function resolveAudioUrl(sound: { title: string; tags: string[]; audioUrl: string }): string {
  if (sound.audioUrl.startsWith(`${AUDIO_BASE}/`)) return sound.audioUrl;
  const tagKey = sound.tags.join("|");
  const match =
    MOCK_SOUNDS.find((s) => s.title === sound.title) ??
    MOCK_SOUNDS.find((s) => s.tags.join("|") === tagKey);
  return match?.audioUrl ?? sound.audioUrl;
}

export const MOCK_PROJECTS: MockProject[] = [
  {
    id: "prj_1",
    name: "Nightfall — Indie Game",
    description: "Sound palette for a dark stealth action game.",
    productionType: "Game",
    createdAt: "Jun 12, 2026",
    soundCount: 4,
    updatedAt: "2 hours ago",
    cover: "linear-gradient(135deg, oklch(0.42 0.15 280), oklch(0.28 0.12 260))",
    soundIds: ["snd_1", "snd_2", "snd_4", "snd_6"],
  },
  {
    id: "prj_2",
    name: "The Silent Woods — Short Film",
    description: "Ambient atmosphere for a short horror film.",
    productionType: "Film",
    createdAt: "May 28, 2026",
    soundCount: 3,
    updatedAt: "yesterday",
    cover: "linear-gradient(135deg, oklch(0.55 0.15 160), oklch(0.35 0.12 200))",
    soundIds: ["snd_3", "snd_5", "snd_7"],
  },
  {
    id: "prj_3",
    name: "Aurora — Podcast Intro",
    description: "Branding stingers and transition beds.",
    productionType: "Podcast",
    createdAt: "Apr 09, 2026",
    soundCount: 2,
    updatedAt: "3 days ago",
    cover: "linear-gradient(135deg, oklch(0.55 0.19 30), oklch(0.4 0.18 350))",
    soundIds: ["snd_7", "snd_8"],
  },
  {
    id: "prj_4",
    name: "Skybreaker — Ad Campaign",
    description: "Trailer impacts and epic risers.",
    productionType: "Advertisement",
    createdAt: "Mar 22, 2026",
    soundCount: 3,
    updatedAt: "last week",
    cover: "linear-gradient(135deg, oklch(0.6 0.18 250), oklch(0.4 0.2 300))",
    soundIds: ["snd_4", "snd_8", "snd_2"],
  },
];


export const SUGGESTED_PROMPTS = [
  "Dark dungeon ambience",
  "Sci-fi corridor",
  "Fantasy forest",
  "Explosion",
  "Magic spell",
  "Horror atmosphere",
  "Emotional piano",
  "Cinematic transition",
];

export const CATEGORIES = ["All", "Ambience", "SFX", "Music", "Impact", "Transition", "Nature"];
export const MOODS = ["All", "Mysterious", "Tense", "Peaceful", "Epic", "Ominous", "Whimsical", "Melancholic", "Energetic"];

export const RECENT_ACTIVITY = [
  { id: "a1", action: "Generated", target: "Dark Dungeon Ambience", time: "10 min ago" },
  { id: "a2", action: "Refined", target: "Cinematic Impact", time: "1 hr ago" },
  { id: "a3", action: "Exported", target: "Magic Spell Sparkle (WAV)", time: "3 hrs ago" },
  { id: "a4", action: "Created project", target: "Nightfall — Indie Game", time: "yesterday" },
];
