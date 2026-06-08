import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useWorkoutHistory } from '../../hooks/useWorkoutHistory';
import { exportToCSV } from '../../utils/csvExport';
import { WorkoutSession } from '../../types/workout';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function SessionCard({
  session,
  onDelete,
}: {
  session: WorkoutSession;
  onDelete: () => void;
}) {
  return (
    <View className="bg-zinc-900 rounded-2xl p-4 mb-3 border border-zinc-800">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-white font-bold text-base">{session.program}</Text>
          <Text className="text-zinc-400 text-sm capitalize">
            {formatDate(session.date)} · {session.day} · {session.mood} energy
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Delete session?', 'This cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: onDelete },
            ])
          }
          className="p-1 ml-2"
          activeOpacity={0.7}
        >
          <Text className="text-zinc-600 text-base">✕</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-2 mb-2">
        <View className="bg-zinc-800 rounded-lg px-3 py-1">
          <Text className="text-zinc-300 text-xs">
            {session.exercises.length} exercises
          </Text>
        </View>
        <View className="bg-zinc-800 rounded-lg px-3 py-1">
          <Text className="text-zinc-300 text-xs">{session.durationMinutes} min</Text>
        </View>
      </View>

      <Text className="text-zinc-500 text-xs" numberOfLines={2}>
        {session.exercises.map((e) => e.name).join(' · ')}
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const { sessions, loading, remove, clear, refresh } = useWorkoutHistory();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleExport = async () => {
    if (sessions.length === 0) {
      Alert.alert('No history', 'Complete some workouts first!');
      return;
    }
    try {
      await exportToCSV(sessions);
    } catch {
      Alert.alert('Export failed', 'Could not export workout history.');
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Clear all history?',
      'This permanently deletes all your workout sessions.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clear },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <Text className="text-zinc-400">Loading history...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-zinc-950">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <Text className="text-white font-bold text-xl">
          {sessions.length === 0
            ? 'No history yet'
            : `${sessions.length} session${sessions.length !== 1 ? 's' : ''}`}
        </Text>
        {sessions.length > 0 && (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleExport}
              className="bg-blue-600 rounded-xl px-3 py-2"
              activeOpacity={0.7}
            >
              <Text className="text-white text-xs font-semibold">Export CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleClear}
              className="bg-zinc-800 rounded-xl px-3 py-2"
              activeOpacity={0.7}
            >
              <Text className="text-zinc-300 text-xs font-semibold">Clear All</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {sessions.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">🏋️</Text>
          <Text className="text-white text-lg font-semibold text-center mb-2">
            No workouts yet
          </Text>
          <Text className="text-zinc-500 text-sm text-center">
            Complete a workout and it will appear here!
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SessionCard session={item} onDelete={() => remove(item.id)} />
          )}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        />
      )}
    </View>
  );
}
