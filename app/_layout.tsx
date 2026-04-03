import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { useStore } from '../src/store/useStore';
import { Colors } from '../src/constants/theme';
import { getActiveDeviations } from '../src/engine/deviations';

function TabIcon({ emoji, focused, badge }: { emoji: string; focused: boolean; badge?: number }) {
  return (
    <View style={{ position: 'relative' }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
      {badge != null && badge > 0 && (
        <View style={{
          position: 'absolute',
          top: -4,
          right: -10,
          backgroundColor: Colors.accent,
          borderRadius: 8,
          minWidth: 16,
          height: 16,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 3,
        }}>
          <Text style={{
            color: Colors.background,
            fontSize: 9,
            fontWeight: '800',
          }}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

export default function Layout() {
  const loadSettings = useStore(s => s.loadSettings);
  const trueCount = useStore(s => s.trueCount);
  const cardsDealt = useStore(s => s.cardsDealt);
  const decksRemaining = useStore(s => s.decksRemaining);
  const surrenderAvailable = useStore(s => s.rules.surrenderAvailable);
  const numDecks = useStore(s => s.rules.numDecks);
  const systemId = useStore(s => s.systemId);

  const activeDevCount = cardsDealt > 0
    ? getActiveDeviations(trueCount, surrenderAvailable !== 'none', systemId, numDecks, decksRemaining).length
    : 0;

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
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
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
            tabBarIcon: ({ focused }) => <TabIcon emoji="⚡" focused={focused} badge={activeDevCount} />,
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
          name="other"
          options={{
            title: 'Training',
            headerTitle: 'Training',
            tabBarIcon: ({ focused }) => <TabIcon emoji="🎯" focused={focused} />,
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
        {/* Hidden - accessed via Other tab */}
        <Tabs.Screen name="train" options={{ href: null }} />
        <Tabs.Screen name="sessions" options={{ href: null }} />
      </Tabs>
    </>
  );
}
