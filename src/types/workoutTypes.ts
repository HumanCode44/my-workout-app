export type Exercise = {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  key: string;
};
export type ExerciseType = 'weight' | 'cardio' | 'bodyweight' | 'yoga' | 'rest' | 'interval';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type MoodLevel = 'okay' | 'good' | 'great';

export interface ExerciseTemplate {
  name: string;
  type: ExerciseType;
  // Common properties (optional)
  sets?: number;
  reps?: number | string;  // Allow string for "AMRAP" and "5/3/1 scheme"
  weight?: number;
  rest?: string;
  // Cardio-specific
  duration?: string;
  // Interval-specific
  work?: string;
  // Other
  description?: string;
  notes?: string;
}
export interface WorkoutEntry {
  date: string;
  day: string;
  mood: string;
  program: string;
  workoutName: string;
  exercise: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: string;
  rest?: string;
  type: ExerciseType;
  key: string;
}

export interface workoutTemplates {
  [program: string]: {
    [day in DayOfWeek]: {
      [mood in MoodLevel]: ExerciseTemplate[];
    };
  };
}
