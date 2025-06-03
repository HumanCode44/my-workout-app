import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import GenerateSuggestedWorkout from './GenerateSuggestedWorkout';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="GenerateWorkout" component={GenerateSuggestedWorkout} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}