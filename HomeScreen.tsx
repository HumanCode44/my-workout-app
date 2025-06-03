import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, FlatList, Alert, TouchableOpacity, Platform, StatusBar, SafeAreaView } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { styles } from '../my-workout-app/styles';
import GenerateSuggestedWorkout from '../my-workout-app/GenerateSuggestedWorkout';
import { useNavigation } from '@react-navigation/native';

type ExerciseType = 'weight' | 'cardio' | 'bodyweight' | 'yoga';

interface ExerciseTemplate {
  name: string;
  type: ExerciseType;
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
  type: ExerciseType;
  key: string;
}

interface WorkoutTemplates {
  [program: string]: {
    [day: string]: {
      [mood: string]: ExerciseTemplate[];
    };
  };
}

const rawWorkoutTemplates: WorkoutTemplates = require('./assets/workoutTemplates.json');

export default function HomeScreen() {
  const [restSeconds, setRestSeconds] = useState<number>(60);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [mood, setMood] = useState<string>('Good');
  const [workouts, setWorkouts] = useState<WorkoutTemplates>({});
  const [day, setDay] = useState<string>('Monday');
  const [program, setProgram] = useState<string>(Object.keys(rawWorkoutTemplates)[0]);
  const [mode, setMode] = useState<'Suggested' | 'Custom'>('Suggested');
  const [workoutLog, setWorkoutLog] = useState<WorkoutEntry[]>([]);
  const [workoutName, setWorkoutName] = useState<string>('');
  const [exercise, setExercise] = useState<string>('');
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(10);
  const [weight, setWeight] = useState<number>(0);
  const [rest, setRest] = useState<string>('60s');
  const [duration, setDuration] = useState<string>('30min');
  const [isLoading, setIsLoading] = useState(true);
const navigation = useNavigation();
  useEffect(() => {
    try {
      setWorkouts(rawWorkoutTemplates);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading templates:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isResting && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds(prev => prev - 1);
      }, 1000);
    } else if (restSeconds === 0) {
      setIsResting(false);
      Alert.alert('Rest Complete', 'Time to start your next set!');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isResting, restSeconds]);

  const addCustomExercise = () => {
    if (!workoutName || !exercise) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    let exerciseType: ExerciseType = 'weight';
    const lowerCaseExercise = exercise.toLowerCase();
    
    if (['walk', 'run', 'jog', 'bike', 'swim'].includes(lowerCaseExercise)) {
      exerciseType = 'cardio';
    } else if (['yoga', 'stretch', 'meditation'].includes(lowerCaseExercise)) {
      exerciseType = 'yoga';
    } else if (['pushup', 'pullup', 'situp', 'bodyweight'].includes(lowerCaseExercise)) {
      exerciseType = 'bodyweight';
    }
    
    const newEntry: WorkoutEntry = {
      date: new Date().toISOString().split('T')[0],
      day,
      mood,
      program,
      workoutName,
      exercise,
      sets: exerciseType === 'cardio' || exerciseType === 'yoga' ? undefined : sets,
      reps: exerciseType === 'cardio' || exerciseType === 'yoga' ? undefined : reps,
      weight: exerciseType === 'weight' ? weight : undefined,
      duration: exerciseType === 'cardio' || exerciseType === 'yoga' ? duration : undefined,
      rest: exerciseType !== 'cardio' && exerciseType !== 'yoga' ? rest : undefined,
      type: exerciseType,
      key: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setWorkoutLog([...workoutLog, newEntry]);
    setExercise('');
    setWeight(0);
    Alert.alert('Success', 'Exercise added to your workout!');
  };

  const saveToCSV = async () => {
    if (workoutLog.length === 0) {
      Alert.alert('Error', 'No workouts to save');
      return;
    }

    const headers = Object.keys(workoutLog[0])
      .filter(k => k !== 'key')
      .join(',');
      
    const rows = workoutLog.map(entry => {
      const { key, ...rest } = entry;
      return Object.values(rest).map(val => 
        val === undefined ? '' : `"${val}"`
      ).join(',');
    }).join('\n');
    
    const csv = `${headers}\n${rows}`;
    
    const filename = FileSystem.documentDirectory + `workout_log_${Date.now()}.csv`;
    
    try {
      await FileSystem.writeAsStringAsync(filename, csv);
      Alert.alert(
        'Success',
        'Workout log saved!',
        [
          { text: 'OK' },
          { text: 'Share', onPress: () => Sharing.shareAsync(filename) }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout log');
      console.error(error);
    }
  };

  const clearLog = () => {
    Alert.alert(
      'Confirm',
      'Are you sure you want to clear your workout log?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => setWorkoutLog([]) }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>🏋️ Workout Planner</Text>
          <Text style={styles.subtitle}>Generate suggested workouts or build your own session</Text>
        </View>
        
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'Suggested' && styles.activeToggle]}
            onPress={() => setMode('Suggested')}
          >
            <Text style={[styles.toggleText, mode === 'Suggested' && styles.activeToggleText]}>Suggested</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'Custom' && styles.activeToggle]}
            onPress={() => setMode('Custom')}
          >
            <Text style={[styles.toggleText, mode === 'Custom' && styles.activeToggleText]}>Custom</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <Text style={{ color: "#fff", marginRight: 10 }}>Rest Timer: {restSeconds}s</Text>
  
          {!isResting ? (
            <TouchableOpacity onPress={() => setIsResting(true)} style={styles.restButton}>
              <Text style={styles.restButtonText}>Start Rest</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsResting(false)} style={styles.restButton}>
              <Text style={styles.restButtonText}>Pause</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              setIsResting(false);
              setRestSeconds(60);
            }}
            style={[styles.restButton, { marginLeft: 10 }]}
          >
            <Text style={styles.restButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Activity</Text>
          
          <Text style={styles.label}>What program are you working on?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.keys(workouts).map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.dayButton, program === p && styles.activeDayButton]}
                onPress={() => setProgram(p)}
              >
                <Text style={styles.dayButtonText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>How are you feeling?</Text>
          <View style={styles.segmentedControl}>
            {['Okay', 'Good', 'Great'].map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.segment, mood === option && styles.activeSegment]}
                onPress={() => setMood(option)}
              >
                <Text style={[styles.segmentText, mood === option && styles.activeSegmentText]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>What day is it?</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysContainer}
          >
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.dayButton, day === d && styles.activeDayButton]}
                onPress={() => setDay(d)}
              >
                <Text style={[styles.dayButtonText, day === d && styles.activeDayButtonText]}>
                  {d.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {mode === 'Suggested' ? (
          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => navigation.navigate('GenerateWorkout', { 
              workouts,
              program,
              day,
              mood,
              isLoading,
              workoutLog,
              setWorkoutLog
            })}
          >
            <Text style={styles.generateButtonText}>Generate Workout</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}