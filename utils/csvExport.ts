import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { WorkoutSession } from '../types/workout';

function escapeField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function exportToCSV(sessions: WorkoutSession[]): Promise<void> {
  const headers = [
    'Date',
    'Program',
    'Day',
    'Energy',
    'Duration (min)',
    'Exercises',
    'Details',
  ];

  const rows = sessions.map((s) => [
    new Date(s.date).toLocaleDateString('en-US'),
    s.program,
    s.day,
    s.mood,
    String(s.durationMinutes),
    String(s.exercises.length),
    s.exercises
      .map((e) => `${e.name} ${e.sets}x${e.reps}${e.weight ? ` @${e.weight}lb` : ''}`)
      .join('; '),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeField).join(','))
    .join('\n');

  const path = `${FileSystem.documentDirectory}workouts_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(path, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(path, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Workout History',
  });
}
