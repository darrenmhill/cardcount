import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize } from '../constants/theme';

interface ShoeProgressProps {
  cardsDealt: number;
  totalCards: number;
  penetration: number; // 0-1, the configured shuffle point
}

export function ShoeProgress({ cardsDealt, totalCards, penetration }: ShoeProgressProps) {
  const pct = totalCards > 0 ? (cardsDealt / totalCards) * 100 : 0;
  const penPct = penetration * 100;
  const pastPenetration = pct >= penPct;

  return (
    <View style={styles.container}>
      <View style={styles.barBg}>
        {/* Dealt portion */}
        <View style={[
          styles.barFill,
          {
            width: `${Math.min(pct, 100)}%`,
            backgroundColor: pastPenetration ? Colors.danger : Colors.primary,
          },
        ]} />
        {/* Penetration marker */}
        <View style={[styles.penMarker, { left: `${penPct}%` }]} />
      </View>
      <View style={styles.labels}>
        <Text style={styles.labelText}>{cardsDealt}/{totalCards}</Text>
        {pastPenetration && (
          <Text style={styles.shuffleText}>SHUFFLE</Text>
        )}
        <Text style={styles.labelText}>{Math.round(penPct)}% cut</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  barBg: {
    height: 6,
    backgroundColor: Colors.card,
    borderRadius: 3,
    overflow: 'visible',
    position: 'relative',
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
  penMarker: {
    position: 'absolute',
    top: -3,
    width: 2,
    height: 12,
    backgroundColor: Colors.accent,
    borderRadius: 1,
    marginLeft: -1,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  labelText: {
    color: Colors.textDim,
    fontSize: 9,
    fontWeight: '600',
  },
  shuffleText: {
    color: Colors.danger,
    fontSize: 9,
    fontWeight: '800',
  },
});
