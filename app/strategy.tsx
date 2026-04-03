import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../src/store/useStore';
import { Colors, Spacing, FontSize } from '../src/constants/theme';
import { generateBasicStrategy, DEALER_CARDS, HARD_TOTALS, SOFT_TOTALS, PAIRS, getActionColor, getActionName } from '../src/engine/basicStrategy';
import { HandType, Action } from '../src/types';

type Tab = 'hard' | 'soft' | 'pair';

export default function StrategyScreen() {
  const { rules } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('hard');

  const strategy = useMemo(() => generateBasicStrategy(rules), [rules]);

  const rows = activeTab === 'hard' ? HARD_TOTALS
    : activeTab === 'soft' ? SOFT_TOTALS
    : PAIRS;

  const matrix = strategy[activeTab];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['hard', 'soft', 'pair'] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'hard' ? 'Hard Totals' : tab === 'soft' ? 'Soft Totals' : 'Pairs'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll}>
        {/* Legend */}
        <View style={styles.legend}>
          <LegendItem action="H" label="Hit" />
          <LegendItem action="S" label="Stand" />
          <LegendItem action="Dh" label="Double" />
          <LegendItem action="P" label="Split" />
          <LegendItem action="Rh" label="Surrender" />
        </View>

        {/* Matrix */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Header row */}
            <View style={styles.row}>
              <View style={[styles.cell, styles.headerCell, styles.rowHeader]}>
                <Text style={styles.headerText}>
                  {activeTab === 'pair' ? 'Pair' : activeTab === 'soft' ? 'Hand' : 'Total'}
                </Text>
              </View>
              {DEALER_CARDS.map(dc => (
                <View key={dc} style={[styles.cell, styles.headerCell]}>
                  <Text style={styles.headerText}>{dc}</Text>
                </View>
              ))}
            </View>

            {/* Data rows */}
            {rows.map(row => (
              <View key={row} style={styles.row}>
                <View style={[styles.cell, styles.rowHeader]}>
                  <Text style={styles.rowHeaderText}>{row}</Text>
                </View>
                {DEALER_CARDS.map(dc => {
                  const action = matrix[row]?.[dc] || 'H';
                  return (
                    <TouchableOpacity
                      key={dc}
                      style={[styles.cell, { backgroundColor: getActionColor(action) + '30' }]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.cellText, { color: getActionColor(action) }]}>
                        {action}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Action descriptions */}
        <View style={styles.actionDescriptions}>
          <Text style={styles.descTitle}>Action Key</Text>
          <ActionDesc code="H" desc="Hit — take another card" />
          <ActionDesc code="S" desc="Stand — keep current hand" />
          <ActionDesc code="D" desc="Double — double bet, take one card" />
          <ActionDesc code="Dh" desc="Double if allowed, otherwise Hit" />
          <ActionDesc code="Ds" desc="Double if allowed, otherwise Stand" />
          <ActionDesc code="P" desc="Split — split the pair" />
          <ActionDesc code="Rh" desc="Surrender if allowed, otherwise Hit" />
          <ActionDesc code="Rs" desc="Surrender if allowed, otherwise Stand" />
          <ActionDesc code="Rp" desc="Surrender if allowed, otherwise Split" />
        </View>

        {/* Rules summary */}
        <View style={styles.rulesBox}>
          <Text style={styles.rulesTitle}>Current Rules</Text>
          <Text style={styles.rulesText}>
            {rules.numDecks} deck{rules.numDecks > 1 ? 's' : ''} • {rules.dealerHitsSoft17 ? 'H17' : 'S17'} • {rules.doubleAfterSplit ? 'DAS' : 'No DAS'} • {rules.surrenderAvailable === 'none' ? 'No Surrender' : rules.surrenderAvailable === 'late' ? 'Late Surrender' : 'Early Surrender'} • Double on {rules.doubleOn} • BJ pays {rules.blackjackPays}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendItem({ action, label }: { action: Action; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: getActionColor(action) }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function ActionDesc({ code, desc }: { code: string; desc: string }) {
  return (
    <View style={styles.descRow}>
      <Text style={[styles.descCode, { color: getActionColor(code as Action) }]}>{code}</Text>
      <Text style={styles.descText}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.primaryDim,
  },
  tabText: {
    color: Colors.textDim,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.text,
  },
  scroll: {
    flex: 1,
    padding: Spacing.md,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 4,
  },
  legendLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 38,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  headerCell: {
    backgroundColor: Colors.surfaceLight,
    height: 32,
  },
  rowHeader: {
    width: 42,
    backgroundColor: Colors.surfaceLight,
  },
  headerText: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  rowHeaderText: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  cellText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  actionDescriptions: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
  },
  descTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  descRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  descCode: {
    width: 30,
    fontSize: FontSize.md,
    fontWeight: '800',
  },
  descText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    flex: 1,
  },
  rulesBox: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  rulesTitle: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  rulesText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
});
