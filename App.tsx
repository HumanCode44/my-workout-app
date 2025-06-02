import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, FlatList, Alert, TouchableOpacity, Platform, StatusBar, SafeAreaView } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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

export default function App() {
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
  const [suggestedExercises, setSuggestedExercises] = useState<ExerciseTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRestExerciseKey, setActiveRestExerciseKey] = useState<string | null>(null);
  const [exerciseRestSeconds, setExerciseRestSeconds] = useState<number>(0);

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
    
    const exercises = suggested.map((ex, index) => ({
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
          
          {mode === 'Suggested' && (
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateSuggestedWorkout}
            >
              <Text style={styles.generateButtonText}>Generate Workout</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {mode === 'Suggested' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Suggested Workout</Text>
            
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
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Custom Workout</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Workout Name (e.g., 'Leg Day')"
              placeholderTextColor="#999"
              value={workoutName}
              onChangeText={setWorkoutName}
            />
            
            <TextInput
              style={styles.textInput}
              placeholder="Exercise Name"
              placeholderTextColor="#999"
              value={exercise}
              onChangeText={setExercise}
            />
            
            {exercise.toLowerCase() === 'cardio' || exercise.toLowerCase() === 'yoga' ? (
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Duration:</Text>
                <TextInput
                  style={styles.numberInput}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="e.g., 30min"
                />
              </View>
            ) : (
              <>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Sets:</Text>
                  <TextInput
                    style={styles.numberInput}
                    keyboardType="numeric"
                    value={sets.toString()}
                    onChangeText={(text) => setSets(parseInt(text) || 1)}
                  />
                </View>
                
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Reps:</Text>
                  <TextInput
                    style={styles.numberInput}
                    keyboardType="numeric"
                    value={reps.toString()}
                    onChangeText={(text) => setReps(parseInt(text) || 1)}
                  />
                </View>
                
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Weight (lbs):</Text>
                  <TextInput
                    style={styles.numberInput}
                    keyboardType="numeric"
                    value={weight.toString()}
                    onChangeText={(text) => setWeight(parseInt(text) || 0)}
                  />
                </View>
                
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Rest:</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={rest}
                    onChangeText={setRest}
                    placeholder="e.g., 60s"
                  />
                </View>
              </>
            )}
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={addCustomExercise}
            >
              <Text style={styles.addButtonText}>Add Exercise</Text>
            </TouchableOpacity>
            
            {workoutLog.length > 0 && (
              <View style={styles.logSection}>
                <Text style={styles.sectionTitle}>Your Workout Log</Text>
                <FlatList
                  data={workoutLog}
                  renderItem={({ item }) => (
                    <View style={styles.logEntry}>
                      <Text style={styles.logHeader}>{item.workoutName} - {item.day} ({item.program})</Text>
                      {item.type === 'cardio' || item.type === 'yoga' ? (
                        <Text style={styles.logText}>{item.exercise}: {item.duration}</Text>
                      ) : (
                        <Text style={styles.logText}>
                          {item.exercise}: {item.sets}×{item.reps} @ {item.weight}lbs
                          {item.rest ? ` (Rest: ${item.rest})` : ''}
                        </Text>
                      )}
                    </View>
                  )}
                  keyExtractor={item => item.key}
                />
                
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearLog}
                  >
                    <Text style={styles.clearButtonText}>Clear Log</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.exportButton}
                    onPress={saveToCSV}
                  >
                    <Text style={styles.exportButtonText}>Export as CSV</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles remain the same as in your original code
const styles = StyleSheet.create({
  restTimerText: {
    marginTop: 4,
    color: '#ff5722',
    fontWeight: 'bold',
  },
  restButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  restButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 0 : 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaaaaa',
    marginBottom: 8,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: '#333333',
    overflow: 'hidden',
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#4a90e2',
  },
  toggleText: {
    fontWeight: '600',
    color: '#aaaaaa',
    fontSize: 16,
  },
  activeToggleText: {
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#ffffff',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#dddddd',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: '#333333',
    overflow: 'hidden',
    marginBottom: 20,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeSegment: {
    backgroundColor: '#4a90e2',
  },
  segmentText: {
    fontWeight: '500',
    color: '#aaaaaa',
  },
  activeSegmentText: {
    color: '#ffffff',
  },
  daysContainer: {
    paddingBottom: 8,
    marginBottom: 20,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#333333',
  },
  activeDayButton: {
    backgroundColor: '#4a90e2',
  },
  dayButtonText: {
    fontWeight: '500',
    color: '#aaaaaa',
  },
  activeDayButtonText: {
    color: '#ffffff',
  },
  generateButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  generateButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  exerciseCard: {
    backgroundColor: '#252525',
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#ffffff',
  },
  exerciseSubtitle: {
    fontSize: 14,
    color: '#aaaaaa',
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#252525',
    color: '#ffffff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#dddddd',
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#444444',
    borderRadius: 10,
    padding: 12,
    width: 80,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#252525',
    color: '#ffffff',
  },
  placeholderText: {
    color: '#666666',
    textAlign: 'center',
    paddingVertical: 24,
    fontSize: 15,
  },
  logSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#ffffff',
  },
  logEntry: {
    backgroundColor: '#252525',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  logHeader: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#ffffff',
  },
  logText: {
    color: '#aaaaaa',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: '#333333',
    borderRadius: 10,
    padding: 14,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  exportButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    padding: 14,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});