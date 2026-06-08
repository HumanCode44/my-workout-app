import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { DayOfWeek } from '../types/workout';

const DAYS: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];
const SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  selected: DayOfWeek;
  onSelect: (day: DayOfWeek) => void;
}

export function DaySelector({ selected, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {DAYS.map((day, i) => (
        <TouchableOpacity
          key={day}
          onPress={() => onSelect(day)}
          activeOpacity={0.7}
          className={`mr-2 w-12 h-12 rounded-xl items-center justify-center border ${
            selected === day
              ? 'bg-blue-600 border-blue-500'
              : 'bg-zinc-800 border-zinc-700'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              selected === day ? 'text-white' : 'text-zinc-400'
            }`}
          >
            {SHORT[i]}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export { DAYS };
