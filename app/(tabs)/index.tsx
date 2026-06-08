import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import templates from '../../assets/workoutTemplates.json';
import { ProgramSelector } from '../../components/ProgramSelector';
import { DaySelector } from '../../components/DaySelector';
import { EnergySelector } from '../../components/EnergySelector';
import { DayOfWeek, EnergyLevel, templateToExercise } from '../../types/workout';

const DAYS: DayOfWeek[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
];

function getTodayKey(): DayOfWeek {
  const d = new Date().getDay();
  return DAYS[d === 0 ? 6 : d - 1];
}

export default function HomeScreen() {
  const router = useRouter();
  const programs = Object.keys(templates);
  const [program, setProgram] = useState(programs[0]);
  const [day, setDay] = useState<DayOfWeek>(getTodayKey());
  const [energy, setEnergy] = useState<EnergyLevel>('good');

  function handleSuggestWorkout() {
    const allTemplates = templates as Record<
      string,
      Record<string, Record<string, Record<string, unknown>[]>>
    >;
    const exercises = allTemplates[program]?.[day]?.[energy];

    if (!exercises || exercises.length === 0) {
      Alert.alert(
        'No workout found',
        `No template for "${program}" on ${day} at ${energy} energy. Try a different combination or build your own!`,
        [
          { text: 'Build Custom', onPress: () => router.push('/builder') },
          { text: 'OK', style: 'cancel' },
        ]
      );
      return;
    }

    const mapped = exercises.map((ex, i) =>
      templateToExercise(ex as Record<string, unknown>, i)
    );

    router.push({
      pathname: '/workout',
      params: {
        program,
        day,
        mood: energy,
        exercises: JSON.stringify(mapped),
      },
    });
  }

  return (
    <ScrollView
      className="flex-1 bg-zinc-950"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <View className="mb-6 mt-2">
        <Text className="text-3xl font-bold text-white text-center mb-1">
          Workout Planner
        </Text>
        <Text className="text-zinc-500 text-center text-sm">
          Choose your program, day, and energy level
        </Text>
      </View>

      <View className="bg-zinc-900 rounded-2xl p-4 mb-3">
        <Text className="text-white font-semibold mb-3">Program</Text>
        <ProgramSelector
          programs={programs}
          selected={program}
          onSelect={setProgram}
        />
      </View>

      <View className="bg-zinc-900 rounded-2xl p-4 mb-3">
        <Text className="text-white font-semibold mb-3">Day</Text>
        <DaySelector selected={day} onSelect={setDay} />
      </View>

      <View className="bg-zinc-900 rounded-2xl p-4 mb-6">
        <Text className="text-white font-semibold mb-3">Energy Level</Text>
        <EnergySelector selected={energy} onSelect={setEnergy} />
      </View>

      <TouchableOpacity
        className="bg-blue-600 rounded-2xl py-4 items-center mb-3"
        onPress={handleSuggestWorkout}
        activeOpacity={0.8}
      >
        <Text className="text-white font-bold text-lg">Suggest Workout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="border border-zinc-700 rounded-2xl py-4 items-center"
        onPress={() => router.push('/builder')}
        activeOpacity={0.8}
      >
        <Text className="text-zinc-300 font-semibold">Build Custom Workout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
