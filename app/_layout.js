import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#007AFF',
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ title: 'City Flyers' }} 
      />
      <Stack.Screen 
        name="add-flyer" 
        options={{ title: 'Add Flyer' }} 
      />
      <Stack.Screen 
        name="flyer/[id]" 
        options={{ title: 'Flyer Details' }} 
      />
    </Stack>
  );
}
