import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { EnergyLevel } from '../types/workout';

const OPTIONS: { value: EnergyLevel; label: string; emoji: string }[] = [
  { value: 'okay', label: 'Okay', emoji: '😐' },
  { value: 'good', label: 'Good', emoji: '😊' },
  { value: 'great', label: 'Great', emoji: '🔥' },
];

interface Props {
  selected: EnergyLevel;
  onSelect: (energy: EnergyLevel) => void;
}

export function EnergySelector({ selected, onSelect }: Props) {
  return (
    <View className="flex-row gap-2">
      {OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onSelect(opt.value)}
          activeOpacity={0.7}
          className={`flex-1 py-3 rounded-xl items-center border ${
            selected === opt.value
              ? 'bg-blue-600 border-blue-500'
              : 'bg-zinc-800 border-zinc-700'
          }`}
        >
          <Text className="text-xl">{opt.emoji}</Text>
          <Text
            className={`text-xs font-semibold mt-1 ${
              selected === opt.value ? 'text-white' : 'text-zinc-400'
            }`}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
