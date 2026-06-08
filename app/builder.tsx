import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Exercise, ExerciseType, DayOfWeek } from '../types/workout';

const REST_OPTIONS = ['30s', '45s', '60s', '90s', '120s'];
const DAYS: DayOfWeek[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getTodayKey(): DayOfWeek {
  const d = new Date().getDay();
  return DAYS[d === 0 ? 6 : d - 1];
}

export default function BuilderScreen() {
  const router = useRouter();

  // Workout-level state
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [day, setDay] = useState<DayOfWeek>(getTodayKey());

  // Form state for adding a new exercise
  const [name, setName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('');
  const [type, setType] = useState<ExerciseType>('weight');
  const [rest, setRest] = useState('60s');

  const addExercise = () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Enter an exercise name first.');
      return;
    }
    const exercise: Exercise = {
      key: `custom-${Date.now()}-${exercises.length}`,
      name: name.trim(),
      type,
      sets: parseInt(sets, 10) || 3,
      reps: reps || '10',
      weight: parseInt(weight, 10) || 0,
      rest,
      completed: false,
    };
    setExercises((prev) => [...prev, exercise]);
    setName('');
    setWeight('');
  };

  const removeExercise = (key: string) => {
    setExercises((prev) => prev.filter((e) => e.key !== key));
  };

  const startWorkout = () => {
    if (exercises.length === 0) {
      Alert.alert('No exercises', 'Add at least one exercise first.');
      return;
    }
    router.push({
      pathname: '/workout',
      params: {
        program: 'Custom',
        day,
        mood: 'good',
        exercises: JSON.stringify(exercises),
      },
    });
  };

  return (
    <View className="flex-1 bg-zinc-950">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Day selector */}
        <View className="bg-zinc-900 rounded-2xl p-4 mb-4">
          <Text className="text-white font-semibold mb-3">Day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DAYS.map((d, i) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDay(d)}
                activeOpacity={0.7}
                className={`mr-2 w-12 h-12 rounded-xl items-center justify-center border ${
                  day === d
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-zinc-800 border-zinc-700'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    day === d ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  {DAY_SHORT[i]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Add exercise form */}
        <View className="bg-zinc-900 rounded-2xl p-4 mb-4">
          <Text className="text-white font-semibold mb-3">Add Exercise</Text>

          <Text className="text-zinc-400 text-xs mb-1">Exercise Name</Text>
          <TextInput
            className="bg-zinc-800 text-white rounded-xl px-4 py-3 mb-3"
            placeholder="e.g. Bench Press"
            placeholderTextColor="#52525b"
            value={name}
            onChangeText={setName}
            returnKeyType="done"
            autoCorrect={false}
          />

          {/* Type selector */}
          <Text className="text-zinc-400 text-xs mb-2">Type</Text>
          <View className="flex-row gap-2 mb-3">
            {(['weight', 'bodyweight', 'cardio'] as ExerciseType[]).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                activeOpacity={0.7}
                className={`flex-1 py-2 rounded-xl items-center border ${
                  type === t
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-zinc-800 border-zinc-700'
                }`}
              >
                <Text
                  className={`text-xs font-semibold capitalize ${
                    type === t ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Weight / Sets / Reps */}
          <View className="flex-row gap-2 mb-3">
            {type === 'weight' && (
              <View className="flex-1">
                <Text className="text-zinc-400 text-xs mb-1 text-center">
                  Weight (lb)
                </Text>
                <TextInput
                  className="bg-zinc-800 text-white rounded-xl py-2 text-center"
                  placeholder="0"
                  placeholderTextColor="#52525b"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-zinc-400 text-xs mb-1 text-center">Sets</Text>
              <TextInput
                className="bg-zinc-800 text-white rounded-xl py-2 text-center"
                value={sets}
                onChangeText={setSets}
                keyboardType="numeric"
                selectTextOnFocus
              />
            </View>
            <View className="flex-1">
              <Text className="text-zinc-400 text-xs mb-1 text-center">Reps</Text>
              <TextInput
                className="bg-zinc-800 text-white rounded-xl py-2 text-center"
                value={reps}
                onChangeText={setReps}
                selectTextOnFocus
              />
            </View>
          </View>

          {/* Rest selector */}
          <Text className="text-zinc-400 text-xs mb-2">Rest Duration</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            {REST_OPTIONS.map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRest(r)}
                activeOpacity={0.7}
                className={`mr-2 px-4 py-2 rounded-xl border ${
                  rest === r
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-zinc-800 border-zinc-700'
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    rest === r ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            className="bg-blue-600 rounded-xl py-3 items-center"
            onPress={addExercise}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold">+ Add Exercise</Text>
          </TouchableOpacity>
        </View>

        {/* Exercise list */}
        {exercises.length > 0 ? (
          <View>
            <Text className="text-white font-semibold mb-3">
              Your Workout ({exercises.length})
            </Text>
            {exercises.map((ex) => (
              <View
                key={ex.key}
                className="bg-zinc-900 rounded-2xl p-4 mb-2 flex-row items-center border border-zinc-800"
              >
                <View className="flex-1">
                  <Text className="text-white font-semibold">{ex.name}</Text>
                  <Text className="text-zinc-400 text-xs mt-0.5">
                    {ex.sets}×{ex.reps}
                    {ex.type === 'weight' && ex.weight > 0
                      ? ` @ ${ex.weight}lb`
                      : ''}
                    {' · '}rest {ex.rest}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeExercise(ex.key)}
                  className="p-2"
                  activeOpacity={0.7}
                >
                  <Text className="text-red-500 font-bold text-base">✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center py-8">
            <Text className="text-zinc-600 text-sm">
              Add exercises above to build your workout
            </Text>
          </View>
        )}
      </ScrollView>

      {exercises.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-zinc-950 border-t border-zinc-900">
          <TouchableOpacity
            className="bg-green-600 rounded-2xl py-4 items-center"
            onPress={startWorkout}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">
              Start Workout ({exercises.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
