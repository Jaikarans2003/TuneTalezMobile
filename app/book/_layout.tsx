import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/Colors';

export default function BookLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // This ensures no header is shown
        contentStyle: {
          backgroundColor: Colors.background,
        },
        animation: 'slide_from_right',
      }}
    />
  );
}
