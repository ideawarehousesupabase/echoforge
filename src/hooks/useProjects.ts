import { useState, useEffect, useCallback } from "react";
import {
  getUserProjects,
  getProject,
  getProjectSounds,
  getUserSounds,
  getSound,
  type Project,
  type Sound,
} from "../lib/firestore-data";
import { MOCK_PROJECTS, MOCK_SOUNDS } from "../lib/mock-data";

const adaptMockProject = (mp: typeof MOCK_PROJECTS[0]): Project => ({
  ...mp,
  userId: "mock",
  createdAt: { toDate: () => new Date(mp.createdAt), toMillis: () => new Date(mp.createdAt).getTime() } as any,
  updatedAt: { toDate: () => new Date(), toMillis: () => Date.now() } as any,
});

const adaptMockSound = (ms: typeof MOCK_SOUNDS[0], projectId: string | null = null): Sound => ({
  ...ms,
  userId: "mock",
  projectId,
  createdAt: { toDate: () => new Date(), toMillis: () => Date.now() } as any,
});

/* ------------------------------------------------------------------ */
/*  useUserProjects                                                    */
/* ------------------------------------------------------------------ */

export function useUserProjects(userId: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getUserProjects(userId);
      const mocks = MOCK_PROJECTS.map(adaptMockProject);
      const merged = [...data, ...mocks];
      merged.sort((a, b) => {
        const tA = a.createdAt?.toMillis() ?? 0;
        const tB = b.createdAt?.toMillis() ?? 0;
        return tB - tA;
      });
      setProjects(merged);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) refetch();
    else {
      setProjects([]);
      setLoading(false);
    }
  }, [userId, refetch]);

  return { projects, loading, refetch };
}

/* ------------------------------------------------------------------ */
/*  useProject                                                         */
/* ------------------------------------------------------------------ */

export function useProject(projectId: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      let data = await getProject(projectId);
      if (!data) {
        const mock = MOCK_PROJECTS.find((p) => p.id === projectId);
        if (mock) data = adaptMockProject(mock);
      }
      setProject(data);
    } catch (err) {
      console.error("Failed to fetch project:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) refetch();
    else {
      setProject(null);
      setLoading(false);
    }
  }, [projectId, refetch]);

  return { project, loading, refetch };
}

/* ------------------------------------------------------------------ */
/*  useProjectSounds                                                   */
/* ------------------------------------------------------------------ */

export function useProjectSounds(projectId: string | undefined) {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await getProjectSounds(projectId);
      const mockProject = MOCK_PROJECTS.find((p) => p.id === projectId);
      if (mockProject) {
        const mockSounds = MOCK_SOUNDS.filter((s) => mockProject.soundIds.includes(s.id)).map((s) =>
          adaptMockSound(s, projectId)
        );
        data.push(...mockSounds);
      }
      data.sort((a, b) => {
        const tA = a.createdAt?.toMillis() ?? 0;
        const tB = b.createdAt?.toMillis() ?? 0;
        return tB - tA;
      });
      setSounds(data);
    } catch (err) {
      console.error("Failed to fetch project sounds:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) refetch();
    else {
      setSounds([]);
      setLoading(false);
    }
  }, [projectId, refetch]);

  return { sounds, loading, refetch };
}

/* ------------------------------------------------------------------ */
/*  useUserSounds                                                      */
/* ------------------------------------------------------------------ */

export function useUserSounds(userId: string | undefined) {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await getUserSounds(userId);
      const mocks = MOCK_SOUNDS.map((s) => {
        const p = MOCK_PROJECTS.find((mp) => mp.soundIds.includes(s.id));
        return adaptMockSound(s, p?.id ?? null);
      });
      const merged = [...data, ...mocks];
      merged.sort((a, b) => {
        const tA = a.createdAt?.toMillis() ?? 0;
        const tB = b.createdAt?.toMillis() ?? 0;
        return tB - tA;
      });
      setSounds(merged);
    } catch (err) {
      console.error("Failed to fetch sounds:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) refetch();
    else {
      setSounds([]);
      setLoading(false);
    }
  }, [userId, refetch]);

  return { sounds, loading, refetch };
}

/* ------------------------------------------------------------------ */
/*  useSound                                                           */
/* ------------------------------------------------------------------ */

export function useSound(soundId: string | undefined) {
  const [sound, setSound] = useState<Sound | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!soundId) {
      setSound(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getSound(soundId)
      .then((data) => {
        if (!data) {
          const mock = MOCK_SOUNDS.find((s) => s.id === soundId);
          if (mock) {
            const p = MOCK_PROJECTS.find((mp) => mp.soundIds.includes(mock.id));
            setSound(adaptMockSound(mock, p?.id ?? null));
            return;
          }
        }
        setSound(data);
      })
      .catch((err) => console.error("Failed to fetch sound:", err))
      .finally(() => setLoading(false));
  }, [soundId]);

  return { sound, loading };
}
