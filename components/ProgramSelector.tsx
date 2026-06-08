import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';

interface Props {
  programs: string[];
  selected: string;
  onSelect: (program: string) => void;
}

export function ProgramSelector({ programs, selected, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {programs.map((prog) => (
        <TouchableOpacity
          key={prog}
          onPress={() => onSelect(prog)}
          activeOpacity={0.7}
          className={`mr-2 px-4 py-2 rounded-xl border ${
            selected === prog
              ? 'bg-blue-600 border-blue-500'
              : 'bg-zinc-800 border-zinc-700'
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              selected === prog ? 'text-white' : 'text-zinc-300'
            }`}
          >
            {prog}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
