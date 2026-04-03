import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../src/store/useStore';
import { Colors, Spacing, FontSize } from '../src/constants/theme';
import { generateBasicStrategy, DEALER_CARDS, HARD_TOTALS, SOFT_TOTALS, PAIRS, getActionColor, getActionName } from '../src/engine/basicStrategy';
import { getActiveDeviations } from '../src/engine/deviations';
import { COUNTING_SYSTEMS } from '../src/engine/countingSystems';
import { Action, DeviationPlay } from '../src/types';

type Tab = 'hard' | 'soft' | 'pair';

export default function StrategyScreen() {
  const { rules, trueCount, systemId } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('hard');
  const [showDefault, setShowDefault] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    row: string; dc: string; base: Action; dev: DeviationPlay | null;
  } | null>(null);

  const system = COUNTING_SYSTEMS[systemId];
  const strategy = useMemo(() => generateBasicStrategy(rules), [rules]);

  const surrenderAvail = rules.surrenderAvailable !== 'none';
  const activeDevs = useMemo(
    () => getActiveDeviations(trueCount, surrenderAvail),
    [trueCount, surrenderAvail],
  );

  // Build a lookup: handType -> playerHand -> dealerUpcard -> deviation
  const devLookup = useMemo(() => {
    const map = new Map<string, DeviationPlay>();
    for (const dev of activeDevs) {
      if (dev.playerHand === 'any') continue; // insurance — not a matrix cell
      map.set(`${dev.handType}:${dev.playerHand}:${dev.dealerUpcard}`, dev);
    }
    return map;
  }, [activeDevs]);

  const rows = activeTab === 'hard' ? HARD_TOTALS
    : activeTab === 'soft' ? SOFT_TOTALS
    : PAIRS;

  const baseMatrix = strategy[activeTab];

  function getCell(row: string, dc: string): { action: Action; deviation: DeviationPlay | null } {
    const baseAction = baseMatrix[row]?.[dc] || 'H' as Action;
    if (showDefault) return { action: baseAction, deviation: null };

    const dev = devLookup.get(`${activeTab}:${row}:${dc}`) ?? null;
    if (dev) {
      return { action: dev.deviationAction, deviation: dev };
    }
    return { action: baseAction, deviation: null };
  }

  const deviationCount = Array.from(devLookup.values()).filter(
    d => d.handType === activeTab
  ).length;

  const tcColor = trueCount > 0 ? Colors.positive : trueCount < 0 ? Colors.negative : Colors.neutral;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Count banner + toggle */}
      <View style={styles.topBar}>
        <View style={styles.tcInfo}>
          <Text style={styles.tcLabel}>TC:</Text>
          <Text style={[styles.tcValue, { color: tcColor }]}>
            {trueCount > 0 ? '+' : ''}{trueCount.toFixed(1)}
          </Text>
          {!showDefault && deviationCount > 0 && (
            <View style={styles.devCountBadge}>
              <Text style={styles.devCountText}>{deviationCount} dev</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.toggleButton, showDefault && styles.toggleButtonDefault]}
          onPress={() => setShowDefault(!showDefault)}
          activeOpacity={0.7}
        >
          <View style={[styles.toggleDot, showDefault ? styles.toggleDotLeft : styles.toggleDotRight]} />
          <Text style={styles.toggleText}>
            {showDefault ? 'Basic' : 'Adjusted'}
          </Text>
        </TouchableOpacity>
      </View>

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
          {!showDefault && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.deviatedDot]} />
              <Text style={styles.legendLabel}>Deviated</Text>
            </View>
          )}
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
                  const { action, deviation } = getCell(row, dc);
                  const isDeviated = deviation !== null;
                  return (
                    <TouchableOpacity
                      key={dc}
                      style={[
                        styles.cell,
                        { backgroundColor: getActionColor(action) + '30' },
                        isDeviated && styles.deviatedCell,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => setSelectedCell({
                        row, dc,
                        base: baseMatrix[row]?.[dc] || 'H' as Action,
                        dev: deviation,
                      })}
                    >
                      <Text style={[
                        styles.cellText,
                        { color: getActionColor(action) },
                        isDeviated && styles.deviatedCellText,
                      ]}>
                        {action}
                      </Text>
                      {isDeviated && <View style={styles.deviatedMarker} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Mode description */}
        <View style={styles.modeInfo}>
          {showDefault ? (
            <Text style={styles.modeText}>
              Showing standard basic strategy for current rules. Toggle to "Adjusted" to see count-based deviations applied.
            </Text>
          ) : (
            <Text style={styles.modeText}>
              Showing count-adjusted strategy using {system.name} at TC {trueCount > 0 ? '+' : ''}{trueCount.toFixed(1)}. Cells with a gold corner are deviations from basic strategy. Tap any cell for details.
            </Text>
          )}
        </View>

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
            {rules.numDecks} deck{rules.numDecks > 1 ? 's' : ''} • {rules.dealerHitsSoft17 ? 'H17' : 'S17'} • {rules.doubleAfterSplit ? 'DAS' : 'No DAS'} • {rules.surrenderAvailable === 'none' ? 'No Surrender' : rules.surrenderAvailable === 'late' ? 'Late Surrender' : 'Early Surrender'} • Double on {rules.doubleOn} • BJ pays {rules.blackjackPays}{!rules.dealerPeeks ? ' • ENHC' : ''}{rules.originalBetsOnly ? ' (OBO)' : ''}{rules.charlieRule !== 'none' ? ` • ${rules.charlieRule}-Card Charlie` : ''}{rules.csm ? ' • CSM' : ''}
          </Text>
        </View>
      </ScrollView>

      {/* Cell detail modal */}
      <Modal
        visible={selectedCell !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCell(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setSelectedCell(null)}>
          {selectedCell && (
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>
                {activeTab === 'pair' ? `Pair of ${selectedCell.row}` : activeTab === 'soft' ? `Soft ${selectedCell.row}` : `Hard ${selectedCell.row}`} vs Dealer {selectedCell.dc}
              </Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Basic Strategy:</Text>
                <Text style={[styles.detailAction, { color: getActionColor(selectedCell.base) }]}>
                  {selectedCell.base} — {getActionName(selectedCell.base)}
                </Text>
              </View>

              {selectedCell.dev ? (
                <>
                  <View style={[styles.detailRow, styles.detailDevRow]}>
                    <Text style={styles.detailLabel}>Count-Adjusted:</Text>
                    <Text style={[styles.detailAction, { color: getActionColor(selectedCell.dev.deviationAction) }]}>
                      {selectedCell.dev.deviationAction} — {getActionName(selectedCell.dev.deviationAction)}
                    </Text>
                  </View>
                  <View style={styles.detailDevInfo}>
                    <Text style={styles.detailDevName}>{selectedCell.dev.name}</Text>
                    <Text style={styles.detailDevIndex}>
                      Index: TC {selectedCell.dev.direction === '>=' ? '≥' : '≤'} {selectedCell.dev.index > 0 ? '+' : ''}{selectedCell.dev.index}
                    </Text>
                    <Text style={styles.detailDevDesc}>{selectedCell.dev.description}</Text>
                    <Text style={styles.detailDevCategory}>
                      {selectedCell.dev.category === 'illustrious18' ? 'Illustrious 18' : selectedCell.dev.category === 'fab4' ? 'Fab 4' : 'Additional Deviation'}
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.detailNodev}>
                  <Text style={styles.detailNodevText}>
                    No deviation active at current count. Basic strategy applies.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.detailDismiss}
                onPress={() => setSelectedCell(null)}
              >
                <Text style={styles.detailDismissText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Modal>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tcInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tcLabel: {
    color: Colors.textDim,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  tcValue: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  devCountBadge: {
    backgroundColor: Colors.accent + '30',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  devCountText: {
    color: Colors.accent,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryDim + '40',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: Spacing.sm,
  },
  toggleButtonDefault: {
    backgroundColor: Colors.surfaceLight,
  },
  toggleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  toggleDotRight: {
    backgroundColor: Colors.primary,
  },
  toggleDotLeft: {
    backgroundColor: Colors.textDim,
  },
  toggleText: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '700',
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
  deviatedDot: {
    backgroundColor: Colors.accent,
    borderWidth: 1,
    borderColor: Colors.accent,
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
    position: 'relative',
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
  deviatedCell: {
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  deviatedCellText: {
    fontWeight: '900',
  },
  deviatedMarker: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopColor: 'transparent',
    borderRightColor: Colors.accent,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  modeInfo: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  modeText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  actionDescriptions: {
    marginTop: Spacing.lg,
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
  // Cell detail modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  detailCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    maxWidth: 360,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailTitle: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: '800',
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailDevRow: {
    backgroundColor: Colors.accent + '10',
    marginHorizontal: -Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: 6,
    borderBottomWidth: 0,
  },
  detailLabel: {
    color: Colors.textDim,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  detailAction: {
    fontSize: FontSize.md,
    fontWeight: '800',
  },
  detailDevInfo: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  detailDevName: {
    color: Colors.accent,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  detailDevIndex: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginTop: 4,
  },
  detailDevDesc: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginTop: Spacing.sm,
  },
  detailDevCategory: {
    color: Colors.textDim,
    fontSize: FontSize.xs,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  detailNodev: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 8,
  },
  detailNodevText: {
    color: Colors.textDim,
    fontSize: FontSize.sm,
  },
  detailDismiss: {
    marginTop: Spacing.lg,
    alignSelf: 'flex-end',
    backgroundColor: Colors.primaryDim + '40',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  detailDismissText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
