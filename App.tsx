import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, FlatList, Alert, TouchableOpacity, Platform, StatusBar, SafeAreaView } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

type Exercise = {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  key: string;
};

type WorkoutEntry = {
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

type WorkoutTemplates = {
  [program: string]: {
    [day: string]: {
      [mood: string]: string[];
    };
  };
};

export default function App() {
  const [mood, setMood] = useState<string>('Good');
  const [day, setDay] = useState<string>('Monday');
  const [program, setProgram] = useState<string>('Basic');
  const [mode, setMode] = useState<'Suggested' | 'Custom'>('Suggested');
  const [workoutLog, setWorkoutLog] = useState<WorkoutEntry[]>([]);
  const [workoutName, setWorkoutName] = useState<string>('');
  const [exercise, setExercise] = useState<string>('');
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(10);
  const [weight, setWeight] = useState<number>(0);
  const [suggestedExercises, setSuggestedExercises] = useState<Exercise[]>([]);

  // Workout templates
  const workouts: WorkoutTemplates = {
    "Basic": {
      monday: {
        okay: ['Incline DB press', 'Dips'],
        good: ['Bench press', 'Incline bench press', 'Pec fly', 'Tricep pushdown', 'Overhead triceps extension'],
        great: ['Bench press', 'Incline bench press', 'Pec fly', 'Dips', 'Cable crossover', 'Tricep pushdown', 'Overhead triceps extension']
      },
      tuesday: {
        okay: ['Lat pulldown', 'Straight-arm pulldown'],
        good: ['Pull-ups', 'Barbell row', 'Seated cable row', 'Face pulls', 'Bicep curls'],
        great: ['Pull-ups', 'Barbell row', 'T-bar row', 'Lat pulldown', 'Seated cable row', 'Face pulls', 'Bicep curls', 'Hammer curls']
      },
      wednesday: {
        okay: ['Rest'],
        good: ['Light Walk'],
        great: ['Cardio']
      },
      thursday: {
        okay: ['Lateral raises', 'Overhead press'],
        good: ['Overhead press', 'Lateral raises', 'Front raises', 'Rear delt fly'],
        great: ['Overhead press', 'Arnold press', 'Lateral raises', 'Front raises', 'Rear delt fly', 'Shrugs']
      },
      friday: {
        okay: ['Bodyweight squats', 'Leg curl machine'],
        good: ['Back squat', 'Leg press', 'Leg curl', 'Walking lunges', 'Calf raises'],
        great: ['Back squat', 'Hack Squat', 'Romanian deadlift', 'Leg press', 'Walking lunges', 'Calf raises', 'Hip thrusts']
      },
      saturday: {
        okay: ['Rest'],
        good: ['Light Walk'],
        great: ['Cardio']
      },
      sunday: {
        okay: ['Rest'],
        good: ['Light Walk'],
        great: ['Cardio']
      }
    },
    "6-Day PPL": {
      monday: { // Push day
        okay: ['Bench Press ', 'Overhead Press', 'Triceps Dips'],
        good: ['Bench Press', 'Incline Dumbbell Press', 'Overhead Press ', 'Lateral Raises', 'CableTriceps Pushdowns'],
        great: ['Bench Press ', 'Incline Dumbbell Press ', 'Overhead Press', 'Lateral Raises ', 'Cable Flys ', 'Skull Crushers', 'Triceps Rope Pushdown']
      },
      tuesday: { // Pull day
        okay: ['Deadlifts ', 'Pull-Ups ', 'Barbell Rows '],
        good: ['Deadlifts ', 'Pull-Ups ', 'Barbell Rows ', 'Face Pulls', 'Dumbbell Curls'],
        great: ['Deadlifts ', 'Pull-Ups ', 'Barbell Rows ', 'T-Bar Rows', 'Face Pulls ', 'Hammer Curls', 'Preacher Curls']
      },
      wednesday: { // Legs day
        okay: ['Squats ', 'Romanian Deadlifts ', 'Leg Press'],
        good: ['Squats', 'Romanian Deadlifts ', 'Leg Press', 'Leg Curls', 'Calf Raises '],
        great: ['Squats ', 'Romanian Deadlifts ', 'Bulgarian Split Squats', 'Leg Extensions ', 'Seated Leg Curls ', 'Seated Calf Raises ', 'Slant Board Sit Up ']
      },
      thursday: { // Push day
        okay: ['Bench Press ', 'Overhead Press ', 'Triceps Dips'],
        good: ['Bench Press', 'Incline Dumbbell Press', 'Overhead Press ', 'Lateral Raises', 'CableTriceps Pushdowns'],
        great: ['Bench Press ', 'Incline Dumbbell Press ', 'Overhead Press', 'Lateral Raises ', 'Cable Flys ', 'Skull Crushers', 'Triceps Rope Pushdown']
      },
      friday: { // Pull day
        okay: ['Deadlifts ', 'Pull-Ups ', 'Barbell Rows '],
        good: ['Deadlifts ', 'Pull-Ups ', 'Barbell Rows ', 'Face Pulls', 'Dumbbell Curls'],
        great: ['Deadlifts ', 'Pull-Ups ', 'Barbell Rows ', 'T-Bar Rows', 'Face Pulls ', 'Hammer Curls', 'Preacher Curls']
      },
      saturday: { // Legs day
        okay: ['Squats ', 'Romanian Deadlifts ', 'Leg Press'],
        good: ['Squats', 'Romanian Deadlifts ', 'Leg Press', 'Leg Curls', 'Calf Raises '],
        great: ['Squats ', 'Romanian Deadlifts ', 'Bulgarian Split Squats', 'Leg Extensions ', 'Seated Leg Curls ', 'Seated Calf Raises ', 'Slant Board Sit Up ']
      },
      sunday: {
        okay: ['Rest'],
        good: ['Rest'],
        great: ['Rest']
      }
    }
  };

  const generateSuggestedWorkout = () => {
    const focusProgram = program;
    const focusDay = day.toLowerCase();
    const moodLevel = mood.toLowerCase();
    const suggested = workouts[focusProgram]?.[focusDay]?.[moodLevel] || [];
    
    const exercises = suggested.map((ex, index) => {
      let name = ex;
      let suggestedSets = 3;
      let suggestedReps = 10;
      
      if (ex.toLowerCase().includes('x')) {
        const parts = ex.split(' ');
        const [sets, reps] = parts[0].toLowerCase().split('x').map(Number);
        if (!isNaN(sets) && !isNaN(reps)) {
          suggestedSets = sets;
          suggestedReps = reps;
          name = parts.slice(1).join(' ');
        }
      }
      
      return {
        name,
        sets: suggestedSets,
        reps: suggestedReps,
        weight: 0,
        key: `ex-${index}-${Date.now()}`
      };
    });
    
    setSuggestedExercises(exercises);
  };

  const saveSuggestedWorkout = () => {
    const newEntries = suggestedExercises.map(ex => ({
      date: new Date().toISOString().split('T')[0],
      day,
      mood,
      program,
      workoutName: `${program} Workout`,
      exercise: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
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
    
    const newEntry: WorkoutEntry = {
      date: new Date().toISOString().split('T')[0],
      day,
      mood,
      program,
      workoutName,
      exercise,
      sets,
      reps,
      weight,
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

    const headers = Object.keys(workoutLog[0]).filter(k => k !== 'key').join(',');
    const rows = workoutLog.map(entry => {
      const { key, ...rest } = entry;
      return Object.values(rest).join(',');
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
        {/* Header with proper spacing */}
        <View style={styles.header}>
          <Text style={styles.title}>🏋️ Workout Planner</Text>
          <Text style={styles.subtitle}>Generate suggested workouts or build your own session</Text>
        </View>
        
        {/* Mode Toggle */}
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
        
        {/* Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Activity</Text>
          
          {/* Program Selection */}
          <Text style={styles.label}>What program are you working on?</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysContainer}
          >
            {['Basic', '6-Day PPL'].map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.dayButton, program === p && styles.activeDayButton]}
                onPress={() => setProgram(p)}
              >
                <Text style={[styles.dayButtonText, program === p && styles.activeDayButtonText]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Mood Selection */}
          <Text style={styles.label}>How are you feeling?</Text>
          <View style={styles.segmentedControl}>
            {['Okay', 'Good', 'Great'].map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.segment, mood === option && styles.activeSegment]}
                onPress={() => setMood(option)}
              >
                <Text style={[styles.segmentText, mood === option && styles.activeSegmentText]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Day Selection */}
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
                <Text style={[styles.dayButtonText, day === d && styles.activeDayButtonText]}>{d.substring(0, 3)}</Text>
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
        
        {/* Main Content */}
        {mode === 'Suggested' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Suggested Workout</Text>
            
            {suggestedExercises.length > 0 ? (
              <View>
                {suggestedExercises.map((ex, index) => (
                  <View key={ex.key} style={styles.exerciseCard}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    <Text style={styles.exerciseSubtitle}>Suggested: {ex.sets} sets × {ex.reps} reps</Text>
                    
                    <View style={styles.inputRow}>
                      <Text style={styles.inputLabel}>Weight (lbs):</Text>
                      <TextInput
                        style={styles.numberInput}
                        keyboardType="numeric"
                        value={ex.weight.toString()}
                        onChangeText={(text) => {
                          const newExercises = [...suggestedExercises];
                          newExercises[index].weight = parseInt(text) || 0;
                          setSuggestedExercises(newExercises);
                        }}
                      />
                    </View>
                    
                    <View style={styles.inputRow}>
                      <Text style={styles.inputLabel}>Sets:</Text>
                      <TextInput
                        style={styles.numberInput}
                        keyboardType="numeric"
                        value={ex.sets.toString()}
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
                        value={ex.reps.toString()}
                        onChangeText={(text) => {
                          const newExercises = [...suggestedExercises];
                          newExercises[index].reps = parseInt(text) || 1;
                          setSuggestedExercises(newExercises);
                        }}
                      />
                    </View>
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
                      <Text style={styles.logText}>{item.exercise}: {item.sets}×{item.reps} @ {item.weight}lbs</Text>
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

const styles = StyleSheet.create({
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