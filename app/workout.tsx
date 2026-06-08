import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Exercise, DayOfWeek, EnergyLevel, WorkoutSession } from '../types/workout';
import { ExerciseCard } from '../components/ExerciseCard';
import { RestTimerDisplay } from '../components/RestTimerDisplay';
import { useRestTimer } from '../hooks/useRestTimer';
import { saveSession } from '../utils/storage';

export default function WorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    program: string;
    day: string;
    mood: string;
    exercises: string;
  }>();

  const [exercises, setExercises] = useState<Exercise[]>(() => {
    try {
      return JSON.parse(params.exercises ?? '[]') as Exercise[];
    } catch {
      return [];
    }
  });

  const [activeRestKey, setActiveRestKey] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const restTimer = useRestTimer(() => {
    setActiveRestKey(null);
    Alert.alert('Rest complete!', "Time for your next set! 💪");
  });

  const handleStartRest = (key: string, seconds: number) => {
    setActiveRestKey(key);
    restTimer.start(seconds);
  };

  const handleSkipRest = () => {
    setActiveRestKey(null);
    restTimer.reset();
  };

  const updateExercise = (index: number, updates: Partial<Exercise>) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, ...updates } : ex))
    );
  };

  const handleComplete = () => {
    const durationMinutes = Math.max(
      1,
      Math.round((Date.now() - startTimeRef.current) / 60000)
    );
    const completedCount = exercises.filter((e) => e.completed).length;

    Alert.alert(
      'Complete workout?',
      `${completedCount}/${exercises.length} exercises marked done.\nDuration: ~${durationMinutes} min`,
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Save & Finish',
          onPress: async () => {
            const session: WorkoutSession = {
              id: `session-${Date.now()}`,
              date: new Date().toISOString(),
              program: params.program ?? 'Custom',
              day: (params.day ?? 'monday') as DayOfWeek,
              mood: (params.mood ?? 'good') as EnergyLevel,
              exercises,
              durationMinutes,
            };
            await saveSession(session);
            router.back();
          },
        },
      ]
    );
  };

  const completedCount = exercises.filter((e) => e.completed).length;

  return (
    <View className="flex-1 bg-zinc-950">
      <RestTimerDisplay
        seconds={restTimer.seconds}
        isRunning={restTimer.isRunning}
        onSkip={handleSkipRest}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <View className="mb-4">
          <Text className="text-zinc-400 text-sm capitalize">
            {params.program} · {params.day} · {params.mood} energy
          </Text>
          <Text className="text-zinc-600 text-xs mt-1">
            {completedCount}/{exercises.length} done — tap the circle to mark complete
          </Text>
        </View>

        {exercises.length === 0 && (
          <View className="items-center py-12">
            <Text className="text-zinc-500 text-sm">No exercises loaded.</Text>
          </View>
        )}

        {exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.key}
            exercise={exercise}
            onUpdate={(updates) => updateExercise(index, updates)}
            activeRestKey={activeRestKey}
            restSecondsLeft={restTimer.seconds}
            onStartRest={handleStartRest}
          />
        ))}
      </ScrollView>

      {/* Sticky complete button */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-zinc-950 border-t border-zinc-900">
        <TouchableOpacity
          className="bg-green-600 rounded-2xl py-4 items-center"
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-lg">Complete Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
