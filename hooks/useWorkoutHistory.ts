import { useState, useEffect, useCallback } from 'react';
import { WorkoutSession } from '../types/workout';
import {
  loadHistory,
  saveSession,
  deleteSession,
  clearHistory,
} from '../utils/storage';

export function useWorkoutHistory() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await loadHistory();
    setSessions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    async (session: WorkoutSession) => {
      await saveSession(session);
      await refresh();
    },
    [refresh]
  );

  const remove = useCallback(async (id: string) => {
    await deleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const clear = useCallback(async () => {
    await clearHistory();
    setSessions([]);
  }, []);

  return { sessions, loading, save, remove, clear, refresh };
}
