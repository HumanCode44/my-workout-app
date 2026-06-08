import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Exercise, parseRestSeconds } from '../types/workout';

interface Props {
  exercise: Exercise;
  onUpdate: (updates: Partial<Exercise>) => void;
  activeRestKey: string | null;
  restSecondsLeft: number;
  onStartRest: (key: string, seconds: number) => void;
}

export function ExerciseCard({
  exercise,
  onUpdate,
  activeRestKey,
  restSecondsLeft,
  onStartRest,
}: Props) {
  const isThisResting = activeRestKey === exercise.key;

  return (
    <View
      className={`bg-zinc-900 rounded-2xl p-4 mb-3 border ${
        exercise.completed ? 'border-green-700' : 'border-zinc-800'
      }`}
    >
      {/* Header row */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          <Text className="text-white font-bold text-base">{exercise.name}</Text>
          <Text className="text-zinc-500 text-xs capitalize mt-0.5">
            {exercise.type}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onUpdate({ completed: !exercise.completed })}
          activeOpacity={0.7}
          className={`w-7 h-7 rounded-full border-2 items-center justify-center ${
            exercise.completed
              ? 'bg-green-600 border-green-500'
              : 'border-zinc-600'
          }`}
        >
          {exercise.completed && (
            <Text className="text-white text-xs font-bold">✓</Text>
          )}
        </TouchableOpacity>
      </View>

      {exercise.type !== 'rest' && (
        <>
          {/* Weight / Sets / Reps inputs */}
          <View className="flex-row gap-2 mb-3">
            {exercise.type === 'weight' && (
              <View className="flex-1">
                <Text className="text-zinc-400 text-xs mb-1 text-center">
                  Weight (lb)
                </Text>
                <TextInput
                  className="bg-zinc-800 text-white rounded-lg py-2 text-center text-sm"
                  value={exercise.weight === 0 ? '' : exercise.weight.toString()}
                  placeholder="0"
                  placeholderTextColor="#71717a"
                  onChangeText={(t) => onUpdate({ weight: parseInt(t, 10) || 0 })}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-zinc-400 text-xs mb-1 text-center">Sets</Text>
              <TextInput
                className="bg-zinc-800 text-white rounded-lg py-2 text-center text-sm"
                value={exercise.sets.toString()}
                onChangeText={(t) => onUpdate({ sets: parseInt(t, 10) || 1 })}
                keyboardType="numeric"
                selectTextOnFocus
              />
            </View>
            <View className="flex-1">
              <Text className="text-zinc-400 text-xs mb-1 text-center">Reps</Text>
              <TextInput
                className="bg-zinc-800 text-white rounded-lg py-2 text-center text-sm"
                value={exercise.reps.toString()}
                onChangeText={(t) => onUpdate({ reps: t || '1' })}
                keyboardType="default"
                selectTextOnFocus
              />
            </View>
          </View>

          {/* Rest timer button */}
          {exercise.rest ? (
            <TouchableOpacity
              onPress={() =>
                onStartRest(exercise.key, parseRestSeconds(exercise.rest))
              }
              disabled={isThisResting}
              activeOpacity={0.7}
              className={`rounded-xl py-2 px-3 items-center ${
                isThisResting ? 'bg-blue-900' : 'bg-zinc-800'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isThisResting ? 'text-blue-300' : 'text-zinc-400'
                }`}
              >
                {isThisResting
                  ? `Resting... ${restSecondsLeft}s left`
                  : `Start ${exercise.rest} rest`}
              </Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}

      {exercise.type === 'rest' && (
        <Text className="text-zinc-500 text-sm italic">Rest day — take it easy</Text>
      )}
    </View>
  );
}
