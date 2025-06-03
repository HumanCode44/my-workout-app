// WorkoutContext.tsx
import React, { createContext, useContext, useState } from 'react';

type WorkoutLogType = any; // Replace with your actual type if you have one

type WorkoutContextType = {
  workoutLog: WorkoutLogType;
  setWorkoutLog: React.Dispatch<React.SetStateAction<WorkoutLogType>>;
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider = ({ children }: { children: React.ReactNode }) => {
  const [workoutLog, setWorkoutLog] = useState<WorkoutLogType>([]); // or null or {} based on your app

  return (
    <WorkoutContext.Provider value={{ workoutLog, setWorkoutLog }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
