import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getDb } from "./firebase";
import { MOCK_PROJECTS, MOCK_SOUNDS, makeWaveform } from "./mock-data";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Project = {
  id: string;
  userId: string;
  name: string;
  description: string;
  productionType: string;
  cover: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type Sound = {
  id: string;
  userId: string;
  projectId: string | null;
  title: string;
  prompt: string;
  mood: string;
  category: string;
  tags: string[];
  duration: string;
  audioUrl: string;
  waveform: number[];
  favorite: boolean;
  createdAt: Timestamp | null;
};

/* ------------------------------------------------------------------ */
/*  Projects                                                           */
/* ------------------------------------------------------------------ */

export async function getUserProjects(userId: string): Promise<Project[]> {
  const db = getDb();
  const q = query(
    collection(db, "projects"),
    where("userId", "==", userId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Project);
}

export async function getProject(projectId: string): Promise<Project | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, "projects", projectId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Project;
}

export async function createProject(
  userId: string,
  data: {
    name: string;
    description: string;
    productionType: string;
    cover: string;
  },
): Promise<string> {
  const db = getDb();
  const ref = await addDoc(collection(db, "projects"), {
    userId,
    name: data.name,
    description: data.description,
    productionType: data.productionType,
    cover: data.cover,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProject(
  projectId: string,
  patch: Partial<Pick<Project, "name" | "description" | "productionType" | "cover">>,
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, "projects", projectId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, "projects", projectId));
}

/* ------------------------------------------------------------------ */
/*  Sounds                                                             */
/* ------------------------------------------------------------------ */

export async function getUserSounds(userId: string): Promise<Sound[]> {
  const db = getDb();
  const q = query(
    collection(db, "sounds"),
    where("userId", "==", userId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Sound);
}

export async function getProjectSounds(projectId: string): Promise<Sound[]> {
  const db = getDb();
  const q = query(
    collection(db, "sounds"),
    where("projectId", "==", projectId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Sound);
}

export async function createSound(
  userId: string,
  data: {
    projectId?: string | null;
    title: string;
    prompt: string;
    mood: string;
    category: string;
    tags: string[];
    duration: string;
    audioUrl: string;
    waveform: number[];
    favorite?: boolean;
  },
): Promise<string> {
  const db = getDb();
  const ref = await addDoc(collection(db, "sounds"), {
    userId,
    projectId: data.projectId ?? null,
    title: data.title,
    prompt: data.prompt,
    mood: data.mood,
    category: data.category,
    tags: data.tags,
    duration: data.duration,
    audioUrl: data.audioUrl,
    waveform: data.waveform,
    favorite: data.favorite ?? false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function assignSoundToProject(
  soundId: string,
  projectId: string | null,
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, "sounds", soundId), { projectId });
}

export async function getSound(soundId: string): Promise<Sound | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, "sounds", soundId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Sound;
}

/* ------------------------------------------------------------------ */
/*  Seed demo data for first-time users                                */
/* ------------------------------------------------------------------ */

export async function seedMockDataIfNeeded(userId: string): Promise<void> {
  const existing = await getUserProjects(userId);
  if (existing.length > 0) return; // already has data

  // Map old mock IDs to new Firestore IDs so we can link sounds → projects
  const idMap = new Map<string, string>();

  // Seed projects
  for (const mp of MOCK_PROJECTS) {
    const newId = await createProject(userId, {
      name: mp.name,
      description: mp.description,
      productionType: mp.productionType,
      cover: mp.cover,
    });
    idMap.set(mp.id, newId);
  }

  // Seed sounds — figure out which project each sound belongs to
  for (const ms of MOCK_SOUNDS) {
    // Find the first project that contains this sound
    const parentMock = MOCK_PROJECTS.find((p) => p.soundIds.includes(ms.id));
    const projectId = parentMock ? (idMap.get(parentMock.id) ?? null) : null;

    await createSound(userId, {
      projectId,
      title: ms.title,
      prompt: ms.prompt,
      mood: ms.mood,
      category: ms.category,
      tags: ms.tags,
      duration: ms.duration,
      audioUrl: ms.audioUrl,
      waveform: ms.waveform,
      favorite: ms.favorite ?? false,
    });
  }
}
