import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  seconds: number;
  isRunning: boolean;
  onSkip: () => void;
}

export function RestTimerDisplay({ seconds, isRunning, onSkip }: Props) {
  if (!isRunning) return null;

  return (
    <View className="bg-blue-950 mx-4 mt-3 rounded-2xl p-4 flex-row items-center justify-between border border-blue-800">
      <View>
        <Text className="text-blue-300 text-xs font-semibold tracking-widest uppercase mb-1">
          Rest Timer
        </Text>
        <Text className="text-white text-4xl font-bold">{seconds}s</Text>
      </View>
      <TouchableOpacity
        onPress={onSkip}
        activeOpacity={0.7}
        className="bg-blue-700 rounded-xl px-5 py-2.5"
      >
        <Text className="text-white font-semibold text-sm">Skip</Text>
      </TouchableOpacity>
    </View>
  );
}
