import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { useStore } from '../src/store/useStore';
import { Colors } from '../src/constants/theme';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

export default function Layout() {
  const loadSettings = useStore(s => s.loadSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '700' },
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            paddingBottom: 4,
            paddingTop: 4,
            height: 60,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textDim,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Count',
            headerTitle: 'Card Counter',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🃏" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="strategy"
          options={{
            title: 'Strategy',
            headerTitle: 'Basic Strategy',
            tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="deviations"
          options={{
            title: 'Deviations',
            headerTitle: 'Index Plays',
            tabBarIcon: ({ focused }) => <TabIcon emoji="⚡" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="betting"
          options={{
            title: 'Betting',
            headerTitle: 'Bet Spread',
            tabBarIcon: ({ focused }) => <TabIcon emoji="💰" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            headerTitle: 'Game Settings',
            tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
          }}
        />
      </Tabs>
    </>
  );
}
