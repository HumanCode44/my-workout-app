import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession } from '../types/workout';

const KEY = '@workout_history_v1';

export async function loadHistory(): Promise<WorkoutSession[]> {
  try {
    const json = await AsyncStorage.getItem(KEY);
    return json ? (JSON.parse(json) as WorkoutSession[]) : [];
  } catch {
    return [];
  }
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  const history = await loadHistory();
  await AsyncStorage.setItem(KEY, JSON.stringify([session, ...history]));
}

export async function deleteSession(id: string): Promise<void> {
  const history = await loadHistory();
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(history.filter((s) => s.id !== id))
  );
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
