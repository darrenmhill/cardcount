import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { JetBrainsMono_300Light, JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { useStore } from '../src/store/useStore';
import { Colors, Fonts } from '../src/constants/theme';
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
            fontFamily: Fonts.bodyBold,
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

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_300Light,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  const activeDevCount = cardsDealt > 0
    ? getActiveDeviations(trueCount, surrenderAvailable !== 'none', systemId, numDecks, decksRemaining).length
    : 0;

  useEffect(() => {
    loadSettings();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontFamily: Fonts.bodySemiBold, letterSpacing: 1 },
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 0,
            paddingBottom: 4,
            paddingTop: 4,
            height: 60,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textDim,
          tabBarLabelStyle: { fontSize: 10, fontFamily: Fonts.bodyMedium },
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
        {/* Hidden - accessed via Training tab */}
        <Tabs.Screen name="train" options={{ href: null }} />
        <Tabs.Screen name="sessions" options={{ href: null }} />
      </Tabs>
    </>
  );
}
