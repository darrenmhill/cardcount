import { Platform } from 'react-native';
import { DrillResult } from '../engine/training';

export interface Session {
  id: string;
  date: number; // timestamp
  casino: string;
  duration: number; // minutes
  result: number; // units won/lost
  numDecks: number;
  notes: string;
  conditions: string; // e.g. "H17 DAS 75% pen"
}

const SESSIONS_KEY = 'cardcount-sessions';
const DRILLS_KEY = 'cardcount-drills';

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  const AS = (await import('@react-native-async-storage/async-storage')).default;
  return AS.getItem(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { localStorage.setItem(key, value); } catch {}
    return;
  }
  const AS = (await import('@react-native-async-storage/async-storage')).default;
  await AS.setItem(key, value);
}

export async function loadSessions(): Promise<Session[]> {
  const data = await getItem(SESSIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveSessions(sessions: Session[]): Promise<void> {
  await setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export async function loadDrillResults(): Promise<DrillResult[]> {
  const data = await getItem(DRILLS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveDrillResults(results: DrillResult[]): Promise<void> {
  await setItem(DRILLS_KEY, JSON.stringify(results));
}
