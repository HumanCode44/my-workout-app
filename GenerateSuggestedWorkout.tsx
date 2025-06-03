import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, FlatList } from 'react-native';
import { styles } from '../my-workout-app/styles';

interface GenerateSuggestedWorkoutProps {
  workouts: any;
  program: string;
  day: string;
  mood: string;
  isLoading: boolean;
  workoutLog: any[];
  setWorkoutLog: (log: any[]) => void;
}

interface ExerciseTemplate {
  name: string;
  type: 'weight' | 'cardio' | 'bodyweight' | 'yoga';
  sets?: number;
  reps?: number | string;
  weight?: number;
  rest?: string;
  duration?: string;
  key: string;
}

interface WorkoutEntry {
  date: string;
  day: string;
  mood: string;
  program: string;
  workoutName: string;
  exercise: string;
  sets?: number;
  reps?: number | string;
  weight?: number;
  duration?: string;
  rest?: string;
  type: 'weight' | 'cardio' | 'bodyweight' | 'yoga';
  key: string;
}

const GenerateSuggestedWorkout: React.FC<GenerateSuggestedWorkoutProps> = ({
  workouts,
  program,
  day,
  mood,
  isLoading,
  workoutLog,
  setWorkoutLog
}) => {
  const [suggestedExercises, setSuggestedExercises] = useState<ExerciseTemplate[]>([]);
  const [activeRestExerciseKey, setActiveRestExerciseKey] = useState<string | null>(null);
  const [exerciseRestSeconds, setExerciseRestSeconds] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (activeRestExerciseKey && exerciseRestSeconds > 0) {
      interval = setInterval(() => {
        setExerciseRestSeconds((prev) => prev - 1);
      }, 1000);
    } else if (activeRestExerciseKey && exerciseRestSeconds === 0) {
      Alert.alert('Rest Complete', 'Time to start your next set!');
      setActiveRestExerciseKey(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeRestExerciseKey, exerciseRestSeconds]);

  const startExerciseRestTimer = (rest: string, exerciseKey: string) => {
    const seconds = parseInt(rest.replace(/\D/g, '')) || 60;
    setExerciseRestSeconds(seconds);
    setActiveRestExerciseKey(exerciseKey);
  };

  const generateSuggestedWorkout = () => {
    if (isLoading) {
      Alert.alert('Loading', 'Workout templates are still loading');
      return;
    }
    
    const suggested = workouts[program]?.[day.toLowerCase()]?.[mood.toLowerCase()] || [];
    
    const exercises = suggested.map((ex: any, index: number) => ({
      ...ex,
      weight: ex.weight || 0,
      key: ex.key || `ex-${index}-${Date.now()}`
    }));
    
    setSuggestedExercises(exercises);
  };

  const saveSuggestedWorkout = () => {
    const newEntries: WorkoutEntry[] = suggestedExercises.map(ex => ({
      date: new Date().toISOString().split('T')[0],
      day,
      mood,
      program,
      workoutName: `${program} Workout`,
      exercise: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      duration: ex.duration,
      rest: ex.rest,
      type: ex.type,
      key: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    
    setWorkoutLog([...workoutLog, ...newEntries]);
    Alert.alert('Success', 'Workout saved to your log!');
  };

  const renderExerciseInputs = (ex: ExerciseTemplate, index: number) => {
    switch (ex.type) {
      case 'cardio':
      case 'yoga':
        return (
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Duration:</Text>
            <TextInput
              style={styles.numberInput}
              value={ex.duration || ''}
              onChangeText={(text) => {
                const newExercises = [...suggestedExercises];
                newExercises[index].duration = text;
                setSuggestedExercises(newExercises);
              }}
              placeholder="e.g., 30min"
            />
          </View>
        );
      
      case 'weight':
      case 'bodyweight':
        return (
          <>
            {ex.type === 'weight' && (
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Weight (lbs):</Text>
                <TextInput
                  style={styles.numberInput}
                  keyboardType="numeric"
                  value={ex.weight?.toString() || '0'}
                  onChangeText={(text) => {
                    const newExercises = [...suggestedExercises];
                    newExercises[index].weight = parseInt(text) || 0;
                    setSuggestedExercises(newExercises);
                  }}
                />
              </View>
            )}
            
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Sets:</Text>
              <TextInput
                style={styles.numberInput}
                keyboardType="numeric"
                value={ex.sets?.toString() || '3'}
                onChangeText={(text) => {
                  const newExercises = [...suggestedExercises];
                  newExercises[index].sets = parseInt(text) || 1;
                  setSuggestedExercises(newExercises);
                }}
              />
            </View>
            
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Reps:</Text>
              <TextInput
                style={styles.numberInput}
                keyboardType="numeric"
                value={ex.reps?.toString() || '10'}
                onChangeText={(text) => {
                  const newExercises = [...suggestedExercises];
                  newExercises[index].reps = parseInt(text) || 1;
                  setSuggestedExercises(newExercises);
                }}
              />
            </View>
            
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Rest:</Text>
              <TextInput
                style={styles.numberInput}
                value={ex.rest || ''}
                onChangeText={(text) => {
                  const newExercises = [...suggestedExercises];
                  newExercises[index].rest = text;
                  setSuggestedExercises(newExercises);
                }}
                placeholder="e.g., 60s"
              />
            </View>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Suggested Workout</Text>
      
      <TouchableOpacity
        style={styles.generateButton}
        onPress={generateSuggestedWorkout}
      >
        <Text style={styles.generateButtonText}>Generate Workout</Text>
      </TouchableOpacity>
      
      {suggestedExercises.length > 0 ? (
        <View>
          {suggestedExercises.map((ex, index) => (
            <View key={ex.key} style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <Text style={styles.exerciseSubtitle}>
                {ex.type === 'cardio' || ex.type === 'yoga' 
                  ? `Duration: ${ex.duration || 'Not specified'}` 
                  : `Suggested: ${ex.sets || 3} sets × ${ex.reps || 10} reps${ex.rest ? ` (Rest: ${ex.rest})` : ''}`
                }
              </Text>
              
              {ex.rest && (
                activeRestExerciseKey === ex.key ? (
                  <Text style={styles.restTimerText}>
                    ⏱ Resting: {exerciseRestSeconds}s left
                  </Text>
                ) : (
                  <TouchableOpacity
                    style={styles.restButton}
                    onPress={() => ex.rest && startExerciseRestTimer(ex.rest, ex.key)}
                  >
                    <Text style={styles.restButtonText}>Start {ex.rest} Rest</Text>
                  </TouchableOpacity>
                )
              )}
              
              {renderExerciseInputs(ex, index)}
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveSuggestedWorkout}
          >
            <Text style={styles.saveButtonText}>Save This Workout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.placeholderText}>Generate a workout based on your day and energy level</Text>
      )}
    </View>
  );
};

export default GenerateSuggestedWorkout;