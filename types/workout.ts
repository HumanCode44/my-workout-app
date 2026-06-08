export type ExerciseType = 'weight' | 'bodyweight' | 'cardio' | 'rest';
export type EnergyLevel = 'okay' | 'good' | 'great';
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface Exercise {
  key: string;
  name: string;
  type: ExerciseType;
  sets: number;
  reps: number | string;
  weight: number;
  rest: string;
  completed: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  program: string;
  day: DayOfWeek;
  mood: EnergyLevel;
  exercises: Exercise[];
  durationMinutes: number;
}

export function templateToExercise(
  template: Record<string, unknown>,
  index: number
): Exercise {
  const validTypes: ExerciseType[] = ['weight', 'bodyweight', 'cardio', 'rest'];
  const rawType = String(template.type || 'weight');
  return {
    key: `${String(template.name ?? '').toLowerCase().replace(/\s+/g, '-')}-${index}-${Date.now()}`,
    name: String(template.name ?? ''),
    type: validTypes.includes(rawType as ExerciseType)
      ? (rawType as ExerciseType)
      : 'weight',
    sets: Number(template.sets) || 3,
    reps: template.reps ?? 10,
    weight: Number(template.weight) || 0,
    rest: String(template.rest ?? '60s'),
    completed: false,
  };
}

export function parseRestSeconds(restStr: string): number {
  return parseInt(restStr, 10) || 60;
}
