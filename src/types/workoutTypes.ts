export type Exercise = {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  key: string;
};

export type WorkoutEntry = {
  date: string;
  day: string;
  mood: string;
  program: string;
  workoutName: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  key: string;
};

export type WorkoutTemplates = {
  [program: string]: {
    [day: string]: {
      [mood: string]: string[];
    };
  };
};