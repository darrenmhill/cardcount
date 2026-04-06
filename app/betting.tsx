import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeltTexture } from '../src/components/FeltTexture';
import { useStore } from '../src/store/useStore';
import { Colors, Spacing, FontSize } from '../src/constants/theme';
import { getRecommendedBet, getBettingSpreadTable } from '../src/engine/betting';
import { calculateBaseHouseEdge, estimatePlayerEdge, COUNTING_SYSTEMS } from '../src/engine/countingSystems';

export function BettingContent() {
  const { trueCount, runningCount, rules, systemId } = useStore();

  const system = COUNTING_SYSTEMS[systemId];
  const tc = Math.floor(trueCount);
  const bet = getRecommendedBet(tc, rules.numDecks);
  const spreadTable = getBettingSpreadTable(rules.numDecks);
  const baseEdge = calculateBaseHouseEdge(rules);
  const playerEdge = estimatePlayerEdge(trueCount, baseEdge);

  const edgeColor = playerEdge > 0 ? Colors.positive : playerEdge < 0 ? Colors.negative : Colors.neutral;

  return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Current recommendation */}
        <View style={styles.currentBet}>
          <Text style={styles.sectionLabel}>CURRENT RECOMMENDATION</Text>
          <Text style={[styles.betUnits, {
            color: trueCount > 0 ? Colors.positive : Colors.neutral,
          }]}>
            {bet.units} Unit{bet.units !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.betDesc}>{bet.description}</Text>
        </View>

        {/* Edge display */}
        <View style={styles.edgeBox}>
          <View style={styles.edgeRow}>
            <View style={styles.edgeItem}>
              <Text style={styles.edgeLabel}>House Edge (Base)</Text>
              <Text style={[styles.edgeValue, { color: Colors.negative }]}>
                {baseEdge.toFixed(2)}%
              </Text>
            </View>
            <View style={styles.edgeItem}>
              <Text style={styles.edgeLabel}>Player Edge (Current)</Text>
              <Text style={[styles.edgeValue, { color: edgeColor }]}>
                {playerEdge > 0 ? '+' : ''}{playerEdge.toFixed(2)}%
              </Text>
            </View>
          </View>
          <View style={styles.edgeBar}>
            <View style={[
              styles.edgeBarFill,
              {
                backgroundColor: edgeColor,
                width: `${Math.min(Math.max((playerEdge + 3) / 6 * 100, 5), 95)}%`,
              },
            ]} />
            <View style={styles.edgeBarCenter} />
          </View>
          <View style={styles.edgeBarLabels}>
            <Text style={styles.edgeBarLabel}>-3%</Text>
            <Text style={styles.edgeBarLabel}>0%</Text>
            <Text style={styles.edgeBarLabel}>+3%</Text>
          </View>
        </View>

        {/* Betting spread table */}
        <View style={styles.spreadSection}>
          <Text style={styles.sectionTitle}>Betting Spread</Text>
          <Text style={styles.sectionSubtitle}>
            {rules.numDecks <= 2 ? '1-8 spread (pitch game)' : '1-12 spread (shoe game)'}
          </Text>

          {spreadTable.map((row, i) => {
            const isCurrentRange = i === spreadTable.length - 1
              ? tc >= row.trueCount
              : tc >= row.trueCount && tc < spreadTable[i + 1].trueCount;

            return (
              <View
                key={i}
                style={[styles.spreadRow, isCurrentRange && styles.spreadRowActive]}
              >
                <View style={styles.spreadUnits}>
                  <View style={styles.unitDots}>
                    {Array.from({ length: row.units }, (_, j) => (
                      <View
                        key={j}
                        style={[styles.unitDot, isCurrentRange && styles.unitDotActive]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.spreadUnitsText, isCurrentRange && styles.spreadTextActive]}>
                    {row.units}x
                  </Text>
                </View>
                <Text style={[styles.spreadDesc, isCurrentRange && styles.spreadTextActive]}>
                  {row.description}
                </Text>
                {isCurrentRange && (
                  <View style={styles.currentIndicator}>
                    <Text style={styles.currentIndicatorText}>NOW</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Wonging strategy */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Wonging (Back-Counting)</Text>
          <Text style={styles.infoText}>
            Stand behind the table and count without playing. Enter the game when TC ≥ +2 for shoe games or TC ≥ +1 for pitch games. Leave (Wong out) when TC drops below +1.
          </Text>
          <Text style={styles.infoText}>
            This technique maximizes your edge by only playing in favorable conditions, but be aware that some casinos prohibit mid-shoe entry.
          </Text>
        </View>

        {/* Kelly criterion info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Kelly Criterion</Text>
          <Text style={styles.infoText}>
            Optimal bet size = (Edge / Variance) x Bankroll. For blackjack, variance is approximately 1.15. Most professionals use Half-Kelly (50% of optimal) to reduce variance.
          </Text>
          <Text style={styles.infoText}>
            With the current {system.name} system and these rules, the base house edge is {baseEdge.toFixed(2)}%. Each +1 true count adds approximately 0.5% to the player's edge.
          </Text>
        </View>

        {/* Risk of ruin */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Bankroll Requirements</Text>
          <Text style={styles.infoText}>
            For a {rules.numDecks <= 2 ? '1-8' : '1-12'} spread, a minimum bankroll of {rules.numDecks <= 2 ? '200' : '400'} units is recommended to keep the risk of ruin below 5%.
          </Text>
          <Text style={styles.infoText}>
            If your unit is $25, you need a bankroll of ${rules.numDecks <= 2 ? '5,000' : '10,000'} minimum. Higher spreads require proportionally larger bankrolls.
          </Text>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
  );
}

export default function BettingScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <BettingContent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  currentBet: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    color: Colors.textDim,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  betUnits: {
    fontSize: 48,
    fontWeight: '800',
  },
  betDesc: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  edgeBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  edgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  edgeItem: {
    alignItems: 'center',
  },
  edgeLabel: {
    color: Colors.textDim,
    fontSize: FontSize.xs,
    marginBottom: 4,
  },
  edgeValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  edgeBar: {
    height: 8,
    backgroundColor: Colors.card,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  edgeBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 4,
    opacity: 0.6,
  },
  edgeBarCenter: {
    position: 'absolute',
    left: '50%',
    top: -2,
    bottom: -2,
    width: 2,
    backgroundColor: Colors.text,
    opacity: 0.3,
  },
  edgeBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  edgeBarLabel: {
    color: Colors.textDim,
    fontSize: FontSize.xs,
  },
  spreadSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.lg,
  },
  spreadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  spreadRowActive: {
    backgroundColor: Colors.primaryDim + '30',
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  spreadUnits: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  unitDots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 40,
    gap: 2,
  },
  unitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textDim,
  },
  unitDotActive: {
    backgroundColor: Colors.primary,
  },
  spreadUnitsText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  spreadDesc: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    flex: 1,
  },
  spreadTextActive: {
    color: Colors.text,
  },
  currentIndicator: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: Spacing.sm,
  },
  currentIndicatorText: {
    color: Colors.background,
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  infoBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  infoTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
});
