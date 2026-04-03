import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../src/store/useStore';
import { Colors, Spacing, FontSize } from '../src/constants/theme';
import { ILLUSTRIOUS_18, FAB_4, ADDITIONAL_DEVIATIONS, getActiveDeviations } from '../src/engine/deviations';
import { getActionColor } from '../src/engine/basicStrategy';
import { COUNTING_SYSTEMS } from '../src/engine/countingSystems';
import { DeviationPlay } from '../src/types';

type Filter = 'all' | 'active' | 'illustrious18' | 'fab4' | 'additional';

export default function DeviationsScreen() {
  const { trueCount, rules, cardsDealt, systemId } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const surrenderAvail = rules.surrenderAvailable !== 'none';
  const activeDevs = cardsDealt > 0
    ? getActiveDeviations(trueCount, surrenderAvail)
    : [];
  const activeIds = new Set(activeDevs.map(d => d.id));

  let displayDevs: DeviationPlay[];
  switch (filter) {
    case 'active':
      displayDevs = activeDevs;
      break;
    case 'illustrious18':
      displayDevs = ILLUSTRIOUS_18;
      break;
    case 'fab4':
      displayDevs = FAB_4;
      break;
    case 'additional':
      displayDevs = ADDITIONAL_DEVIATIONS;
      break;
    default:
      displayDevs = [...ILLUSTRIOUS_18, ...FAB_4, ...ADDITIONAL_DEVIATIONS];
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Current TC banner */}
      <View style={styles.tcBanner}>
        <Text style={styles.tcLabel}>Current True Count:</Text>
        <Text style={[styles.tcValue, {
          color: trueCount > 0 ? Colors.positive : trueCount < 0 ? Colors.negative : Colors.neutral,
        }]}>
          {trueCount > 0 ? '+' : ''}{trueCount.toFixed(1)}
        </Text>
        <Text style={styles.tcActive}>
          {activeDevs.length} active deviation{activeDevs.length !== 1 ? 's' : ''}
        </Text>
        {systemId !== 'hi-lo' && (
          <Text style={styles.tcNote}>
            Indices are calibrated for Hi-Lo. Values are approximate for {COUNTING_SYSTEMS[systemId].name}.
          </Text>
        )}
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {([
          { key: 'all', label: 'All' },
          { key: 'active', label: `Active (${activeDevs.length})` },
          { key: 'illustrious18', label: 'Illustrious 18' },
          { key: 'fab4', label: 'Fab 4' },
          { key: 'additional', label: 'Additional' },
        ] as { key: Filter; label: string }[]).map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Deviations list */}
      <ScrollView style={styles.list}>
        {displayDevs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No active deviations at current count</Text>
            <Text style={styles.emptySubtext}>
              Deviations will appear here when the true count triggers index plays
            </Text>
          </View>
        ) : (
          displayDevs.map(dev => {
            const isActive = activeIds.has(dev.id);
            const isExpanded = expanded === dev.id;

            return (
              <TouchableOpacity
                key={dev.id}
                style={[styles.devCard, isActive && styles.devCardActive]}
                onPress={() => setExpanded(isExpanded ? null : dev.id)}
                activeOpacity={0.7}
              >
                <View style={styles.devHeader}>
                  <View style={styles.devLeft}>
                    {isActive && <View style={styles.activeDot} />}
                    <Text style={[styles.devName, isActive && styles.devNameActive]}>
                      {dev.name}
                    </Text>
                  </View>
                  <View style={styles.devRight}>
                    <Text style={styles.devIndex}>
                      TC {dev.direction === '>=' ? '≥' : '≤'} {dev.index > 0 ? '+' : ''}{dev.index}
                    </Text>
                  </View>
                </View>

                <View style={styles.devActions}>
                  <View style={styles.actionChip}>
                    <Text style={styles.actionChipLabel}>Normal: </Text>
                    <Text style={[styles.actionChipValue, { color: getActionColor(dev.normalAction) }]}>
                      {dev.playerHand === 'any' ? 'Decline' : dev.normalAction}
                    </Text>
                  </View>
                  <Text style={styles.arrow}>→</Text>
                  <View style={[styles.actionChip, styles.actionChipDeviation]}>
                    <Text style={styles.actionChipLabel}>Deviate: </Text>
                    <Text style={[styles.actionChipValue, { color: getActionColor(dev.deviationAction) }]}>
                      {dev.playerHand === 'any' ? 'Take' : dev.deviationAction}
                    </Text>
                  </View>
                </View>

                {isExpanded && (
                  <View style={styles.devDescription}>
                    <Text style={styles.devDescText}>{dev.description}</Text>
                    <View style={styles.devMeta}>
                      <Text style={styles.devMetaText}>
                        Category: {dev.category === 'illustrious18' ? 'Illustrious 18' : dev.category === 'fab4' ? 'Fab 4' : 'Additional'}
                      </Text>
                      <Text style={styles.devMetaText}>
                        Hand: {dev.playerHand} vs {dev.dealerUpcard}
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tcBanner: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tcLabel: {
    color: Colors.textDim,
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 1,
  },
  tcValue: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  tcActive: {
    color: Colors.accent,
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: 2,
  },
  tcNote: {
    color: Colors.textDim,
    fontSize: FontSize.xs,
    fontStyle: 'italic',
    marginTop: 4,
  },
  filterBar: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexGrow: 0,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    marginRight: Spacing.sm,
  },
  filterTabActive: {
    backgroundColor: Colors.primaryDim,
  },
  filterText: {
    color: Colors.textDim,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  filterTextActive: {
    color: Colors.text,
  },
  list: {
    flex: 1,
    padding: Spacing.md,
  },
  devCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.border,
  },
  devCardActive: {
    borderLeftColor: Colors.accent,
    backgroundColor: Colors.surfaceLight,
  },
  devHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  devLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    marginRight: Spacing.sm,
  },
  devName: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  devNameActive: {
    color: Colors.accent,
  },
  devRight: {},
  devIndex: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  devActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionChip: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  actionChipDeviation: {
    backgroundColor: Colors.cardElevated,
  },
  actionChipLabel: {
    color: Colors.textDim,
    fontSize: FontSize.sm,
  },
  actionChipValue: {
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  arrow: {
    color: Colors.textDim,
    fontSize: FontSize.lg,
  },
  devDescription: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  devDescText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  devMeta: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  devMetaText: {
    color: Colors.textDim,
    fontSize: FontSize.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  emptySubtext: {
    color: Colors.textDim,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxl,
  },
});
