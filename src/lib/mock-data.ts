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

// Public sample audio URLs (Google's sample media / bensound-style CDN alternatives)
const SAMPLE_AUDIO = [
  "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1e15f2b3c9.mp3?filename=cinematic-atmosphere-score-11-30037.mp3",
  "https://cdn.pixabay.com/download/audio/2022/10/25/audio_946bc6b2f2.mp3?filename=ambient-piano-amp-strings-10711.mp3",
  "https://cdn.pixabay.com/download/audio/2023/06/13/audio_59cbc794d8.mp3?filename=cinematic-designed-trailer-hit-3-15rl-14685.mp3",
  "https://cdn.pixabay.com/download/audio/2022/05/16/audio_1808fbf07a.mp3?filename=forest-with-small-river-birds-and-nature-field-recording-6735.mp3",
  "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8e7c9e0a5.mp3?filename=horror-background-atmosphere-156642.mp3",
  "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3?filename=magic-spell-6005.mp3",
];

export const MOCK_SOUNDS: MockSound[] = [
  {
    id: "snd_1",
    title: "Dark Dungeon Ambience",
    prompt: "Dark dungeon ambience with distant echoing drips",
    mood: "Mysterious",
    category: "Ambience",
    tags: ["dungeon", "dark", "echo", "fantasy"],
    duration: "0:42",
    audioUrl: SAMPLE_AUDIO[0],
    waveform: makeWaveform(11),
  },
  {
    id: "snd_2",
    title: "Sci-Fi Corridor Hum",
    prompt: "Sci-fi corridor with low hum and mechanical resonance",
    mood: "Tense",
    category: "Ambience",
    tags: ["sci-fi", "corridor", "hum"],
    duration: "0:38",
    audioUrl: SAMPLE_AUDIO[1],
    waveform: makeWaveform(22),
  },
  {
    id: "snd_3",
    title: "Fantasy Forest Morning",
    prompt: "Fantasy forest with soft wind and distant birds",
    mood: "Peaceful",
    category: "Nature",
    tags: ["forest", "birds", "fantasy"],
    duration: "1:02",
    audioUrl: SAMPLE_AUDIO[3],
    waveform: makeWaveform(33),
  },
  {
    id: "snd_4",
    title: "Cinematic Impact",
    prompt: "Cinematic trailer impact with sub boom",
    mood: "Epic",
    category: "Impact",
    tags: ["cinematic", "impact", "trailer"],
    duration: "0:08",
    audioUrl: SAMPLE_AUDIO[2],
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
    duration: "0:55",
    audioUrl: SAMPLE_AUDIO[4],
    waveform: makeWaveform(55),
  },
  {
    id: "snd_6",
    title: "Magic Spell Sparkle",
    prompt: "Magic spell with shimmering sparkle tail",
    mood: "Whimsical",
    category: "SFX",
    tags: ["magic", "sparkle", "fantasy"],
    duration: "0:04",
    audioUrl: SAMPLE_AUDIO[5],
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
    duration: "0:47",
    audioUrl: SAMPLE_AUDIO[1],
    waveform: makeWaveform(77),
  },
  {
    id: "snd_8",
    title: "Cinematic Transition Whoosh",
    prompt: "Cinematic transition whoosh with rising tail",
    mood: "Energetic",
    category: "Transition",
    tags: ["whoosh", "transition"],
    duration: "0:03",
    audioUrl: SAMPLE_AUDIO[2],
    waveform: makeWaveform(88),
  },
];

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
