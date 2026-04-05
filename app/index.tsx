import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../src/store/useStore';
import { Colors, Spacing, FontSize, monoFont } from '../src/constants/theme';
import { COUNTING_SYSTEMS } from '../src/engine/countingSystems';
import { getRecommendedBet } from '../src/engine/betting';
import { getActiveDeviations } from '../src/engine/deviations';
import { calculateBaseHouseEdge, estimatePlayerEdge } from '../src/engine/countingSystems';
import { Card } from '../src/types';
import { Tooltip } from '../src/components/Tooltip';
import { ConfirmModal } from '../src/components/ConfirmModal';
import { ShoeProgress } from '../src/components/ShoeProgress';

interface CardButton { label: string; card: Card; countOverride?: number; color?: string }

const CARD_BUTTONS: CardButton[] = [
  { label: 'A', card: 'A' },
  { label: '2', card: '2' },
  { label: '3', card: '3' },
  { label: '4', card: '4' },
  { label: '5', card: '5' },
  { label: '6', card: '6' },
  { label: '7', card: '7' },
  { label: '8', card: '8' },
  { label: '9', card: '9' },
  { label: '10', card: '10' },
  { label: 'J', card: 'J' },
  { label: 'Q', card: 'Q' },
  { label: 'K', card: 'K' },
];

// Red 7 system: split 7 into red (+1) and black (0)
const RED7_CARD_BUTTONS: CardButton[] = [
  { label: 'A', card: 'A' },
  { label: '2', card: '2' },
  { label: '3', card: '3' },
  { label: '4', card: '4' },
  { label: '5', card: '5' },
  { label: '6', card: '6' },
  { label: '7', card: '7', countOverride: 1, color: '#ef4444' },   // Red 7
  { label: '7', card: '7', countOverride: 0, color: Colors.textDim }, // Black 7
  { label: '8', card: '8' },
  { label: '9', card: '9' },
  { label: '10', card: '10' },
  { label: 'J', card: 'J' },
  { label: 'Q', card: 'Q' },
  { label: 'K', card: 'K' },
];

export default function CountScreen() {
  const {
    systemId, runningCount, trueCount, cardsDealt, decksRemaining,
    acesDealt, rules, dealCard, undoLastCard, resetShoe, shoeHistory,
  } = useStore();

  const system = COUNTING_SYSTEMS[systemId];
  const totalCards = rules.numDecks * 52;
  const cardsRemaining = totalCards - cardsDealt;
  const penetrationPct = ((cardsDealt / totalCards) * 100).toFixed(0);
  const bet = getRecommendedBet(Math.floor(trueCount), rules.numDecks);
  const baseEdge = calculateBaseHouseEdge(rules);
  const playerEdge = estimatePlayerEdge(trueCount, baseEdge);
  const activeDevs = cardsDealt > 0
    ? getActiveDeviations(trueCount, rules.surrenderAvailable !== 'none', systemId, rules.numDecks, decksRemaining)
    : [];

  const tcColor = trueCount > 0 ? Colors.positive : trueCount < 0 ? Colors.negative : Colors.neutral;

  const totalAces = rules.numDecks * 4;
  const acesRemaining = totalAces - acesDealt;

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Count how many of each card value have been dealt
  // 10, J, Q, K are separate cards but share the "10-value" in counting;
  // however each rank has numDecks*4 copies in the shoe
  const dealtCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of shoeHistory) {
      counts[c] = (counts[c] || 0) + 1;
    }
    return counts;
  }, [shoeHistory]);

  const getMaxForCard = (card: Card): number => rules.numDecks * 4;

  const getRemainingForCard = (card: Card): number => {
    return getMaxForCard(card) - (dealtCounts[card] || 0);
  };

  const getCardCountValue = (card: Card): string => {
    const val = system.values[card];
    if (val > 0) return `+${val}`;
    if (val < 0) return `${val}`;
    return '0';
  };

  const getCardColor = (card: Card): string => {
    const val = system.values[card];
    if (val > 0) return Colors.positive;
    if (val < 0) return Colors.negative;
    return Colors.textDim;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* CSM Warning */}
        {rules.csm && (
          <View style={styles.csmBanner}>
            <Text style={styles.csmBannerText}>CSM table — counting is ineffective</Text>
          </View>
        )}

        {/* System badge */}
        <Tooltip
          title={system.name}
          body={`${system.description}\n\n${system.balanced ? 'Balanced: the card values sum to zero for a full deck, so the running count must be converted to a true count by dividing by decks remaining.' : 'Unbalanced: the card values do NOT sum to zero, so you can use the running count directly without dividing by decks remaining — simpler to use.'}\n\nLevel ${system.level}: ${system.level === 1 ? 'single-value system (easiest to learn)' : system.level === 2 ? 'multi-value system (more accurate, harder to use)' : 'three-level system (highest accuracy, most difficult)'}.${system.sideCountAces ? ' This system requires a separate ace side count.' : ''}`}
        >
          <View style={styles.systemBadge}>
            <Text style={styles.systemName}>{system.name}</Text>
            <Text style={styles.systemType}>
              {system.balanced ? 'Balanced' : 'Unbalanced'} • Level {system.level}
            </Text>
          </View>
        </Tooltip>

        {/* Shoe progress */}
        <ShoeProgress
          cardsDealt={cardsDealt}
          totalCards={totalCards}
          penetration={rules.penetration}
        />

        {/* Main count display */}
        <View style={styles.countContainer}>
          <Tooltip
            title={system.balanced ? 'True Count (TC)' : 'Running Count (RC)'}
            body={system.balanced
              ? 'The True Count is the Running Count divided by the number of decks remaining. It normalizes the count across different shoe sizes and is used for betting and strategy decisions. A positive TC means more high cards remain (favorable to the player).'
              : 'The Running Count is the cumulative total of card values seen so far. For unbalanced systems like KO and Red 7, the running count is used directly for decisions without converting to a true count.'}
          >
            <View style={styles.countMain}>
              <Text style={styles.countLabel}>
                {system.balanced ? 'TRUE COUNT' : 'RUNNING COUNT'}
              </Text>
              <Text style={[styles.countValue, { color: tcColor }]}>
                {trueCount > 0 ? '+' : ''}{system.balanced ? trueCount.toFixed(1) : runningCount}
              </Text>
            </View>
          </Tooltip>

          {system.balanced && (
            <Tooltip
              title="Running Count (RC)"
              body="The raw cumulative count before adjusting for remaining decks. Each card dealt adds or subtracts its system value. The RC is divided by decks remaining to get the True Count. Track this number mentally as cards are dealt."
            >
              <View style={styles.rcDisplay}>
                <Text style={styles.rcLabel}>RC</Text>
                <Text style={styles.rcValue}>
                  {runningCount > 0 ? '+' : ''}{runningCount}
                </Text>
              </View>
            </Tooltip>
          )}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <Tooltip
            title="Cards Dealt"
            body="The total number of cards that have been dealt from the shoe so far. Use this to estimate how deep into the shoe you are and how reliable the count is. Early counts are less reliable than counts deeper into the shoe."
            style={styles.statTooltip}
          >
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{cardsDealt}</Text>
              <Text style={styles.statLabel}>Dealt</Text>
            </View>
          </Tooltip>
          <Tooltip
            title="Cards Remaining"
            body="The estimated number of undealt cards left in the shoe. This is calculated as (total cards in shoe) minus (cards dealt). Used internally to calculate decks remaining for the true count conversion."
            style={styles.statTooltip}
          >
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{cardsRemaining}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </Tooltip>
          <Tooltip
            title="Decks Remaining"
            body="The estimated number of full decks left in the shoe. This is the key divisor for converting running count to true count: TC = RC / Decks Remaining. In a casino, estimate this by looking at the discard tray. Round to the nearest half-deck for mental math."
            style={styles.statTooltip}
          >
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{decksRemaining.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Decks Left</Text>
            </View>
          </Tooltip>
          <Tooltip
            title="Deck Penetration"
            body="The percentage of the shoe that has been dealt. Higher penetration (more cards dealt) gives the counter a bigger advantage because the count becomes more accurate. Most casinos deal 70-80% of a shoe. Below 60% penetration, card counting becomes much less effective."
            style={styles.statTooltip}
          >
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{penetrationPct}%</Text>
              <Text style={styles.statLabel}>Penetration</Text>
            </View>
          </Tooltip>
        </View>

        {/* Ace tracker (for side-count systems) */}
        {system.sideCountAces && (
          <Tooltip
            title="Ace Side Count"
            body={`Systems like ${system.name} assign Aces a value of 0, so they aren't tracked in the main count. But Aces are critical for blackjacks (which pay 3:2), so you need to track them separately.\n\nCompare aces remaining to what you'd expect: ${(totalAces / rules.numDecks).toFixed(0)} aces per deck. If fewer aces remain than expected, the shoe is ace-poor — reduce your bet slightly. If more remain, the shoe is ace-rich — increase your bet.`}
          >
            <View style={styles.aceTracker}>
              {(() => {
                const acesPerDeck = decksRemaining > 0 ? acesRemaining / decksRemaining : 0;
                const aceColor = acesPerDeck < 3.5 ? Colors.danger
                  : acesPerDeck > 4.5 ? Colors.positive
                  : Colors.textSecondary;
                const aceStatus = acesPerDeck < 3.5 ? 'ACE-POOR'
                  : acesPerDeck > 4.5 ? 'ACE-RICH'
                  : '';
                return (
                  <>
                    <View style={styles.aceRow}>
                      <Text style={styles.aceLabel}>Aces: {acesDealt}/{totalAces} dealt</Text>
                      {aceStatus !== '' && (
                        <View style={[styles.aceBadge, { backgroundColor: aceColor + '20', borderColor: aceColor }]}>
                          <Text style={[styles.aceBadgeText, { color: aceColor }]}>{aceStatus}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.aceLabel, { color: aceColor }]}>
                      {acesRemaining} remaining ({acesPerDeck.toFixed(1)}/deck — expect 4.0)
                    </Text>
                  </>
                );
              })()}
            </View>
          </Tooltip>
        )}

        {/* Bet recommendation */}
        <Tooltip
          title="Recommended Bet"
          body={`The suggested bet size in units based on the current true count and a ${rules.numDecks <= 2 ? '1-8' : '1-12'} betting spread.\n\nA "unit" is your minimum bet amount (e.g., $10 or $25). When the count is negative or zero, bet the minimum (1 unit). As the count rises, increase your bet proportionally.\n\nThis spread balances profit potential against detection risk. Larger spreads earn more but attract more attention from casino surveillance. Never bet more than your bankroll can sustain.`}
        >
          <View style={[styles.betBox, { borderColor: tcColor }]}>
            <Text style={[styles.betUnits, { color: tcColor }]}>{bet.units}x</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.betLabel}>BET</Text>
              <Text style={styles.betDesc}>{bet.description}</Text>
            </View>
            <View style={styles.edgePill}>
              <Text style={[styles.edgePillText, {
                color: playerEdge > 0 ? Colors.positive : playerEdge < -1 ? Colors.danger : Colors.textDim,
              }]}>
                {playerEdge > 0 ? '+' : ''}{playerEdge.toFixed(1)}%
              </Text>
            </View>
          </View>
        </Tooltip>

        {/* Active deviations alert */}
        {activeDevs.length > 0 && (
          <Tooltip
            title="Active Deviations"
            body="Deviations (or index plays) are situations where the correct play differs from basic strategy because of the current count. These are based on the Illustrious 18 and Fab 4 — the most valuable deviations identified by Don Schlesinger. When a deviation is active, use the deviation action instead of basic strategy for that specific hand. Tap the Deviations tab for full details."
          >
            <View style={styles.deviationAlert}>
              <Text style={styles.deviationTitle}>
                {activeDevs.length} Active Deviation{activeDevs.length !== 1 ? 's' : ''}
              </Text>
              {activeDevs.slice(0, 5).map(dev => (
                <Text key={dev.id} style={styles.deviationItem}>
                  {dev.name}
                </Text>
              ))}
              {activeDevs.length > 5 && (
                <Text style={styles.deviationMore}>
                  +{activeDevs.length - 5} more — see Deviations tab
                </Text>
              )}
            </View>
          </Tooltip>
        )}
      </ScrollView>

      {/* Card buttons */}
      <View style={styles.cardGrid}>
        {(() => {
          const buttons = systemId === 'red-7' ? RED7_CARD_BUTTONS : CARD_BUTTONS;
          const mid = Math.ceil(buttons.length / 2);
          return [buttons.slice(0, mid), buttons.slice(mid)].map((row, ri) => (
            <View key={ri} style={styles.cardRow}>
              {row.map(({ label, card, countOverride, color }, ci) => {
                const remaining = getRemainingForCard(card);
                // For Red 7 split buttons, each color has half the 7s
                const effectiveRemaining = (countOverride !== undefined && card === '7')
                  ? Math.ceil(remaining / 2)
                  : remaining;
                const exhausted = effectiveRemaining <= 0;
                const btnColor = color || (exhausted ? Colors.textDim : getCardColor(card));
                const isRed7Btn = countOverride !== undefined;
                return (
                  <TouchableOpacity
                    key={`${label}-${ci}`}
                    style={[
                      styles.cardButton,
                      { borderColor: exhausted ? Colors.border : btnColor },
                      exhausted && styles.cardButtonExhausted,
                    ]}
                    onPress={() => dealCard(card, countOverride)}
                    activeOpacity={0.6}
                    disabled={exhausted}
                  >
                    <Text style={[
                      styles.cardLabel,
                      { color: exhausted ? Colors.textDim : btnColor },
                      exhausted && styles.cardLabelExhausted,
                      isRed7Btn && { fontSize: 14 },
                    ]}>
                      {isRed7Btn ? (countOverride === 1 ? '7R' : '7B') : label}
                    </Text>
                    <Text style={[
                      styles.cardRemaining,
                      { color: exhausted ? Colors.textDim : Colors.textSecondary },
                    ]}>
                      {effectiveRemaining}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ));
        })()}

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.undoButton]}
            onPress={undoLastCard}
            disabled={shoeHistory.length === 0}
          >
            <Text style={[styles.actionText, shoeHistory.length === 0 && styles.disabled]}>
              Undo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.resetButton]}
            onPress={() => setShowResetConfirm(true)}
          >
            <Text style={styles.actionText}>New Shoe</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ConfirmModal
        visible={showResetConfirm}
        title="New Shoe"
        message="Reset the count for a new shoe? All card history will be cleared."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          resetShoe();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
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
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  systemBadge: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  systemName: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  systemType: {
    color: Colors.textDim,
    fontSize: FontSize.xs,
    marginTop: 3,
    letterSpacing: 1,
  },
  countContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  countMain: {
    alignItems: 'center',
  },
  countLabel: {
    color: Colors.textDim,
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  countValue: {
    fontSize: 72,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    fontFamily: monoFont,
    letterSpacing: -2,
  },
  rcDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  rcLabel: {
    color: Colors.textDim,
    fontSize: FontSize.xs,
    fontWeight: '500',
    letterSpacing: 2,
    marginRight: Spacing.sm,
  },
  rcValue: {
    color: Colors.textSecondary,
    fontSize: FontSize.lg,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
    fontFamily: monoFont,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: 6,
  },
  statTooltip: {
    flex: 1,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
    height: 52,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
    fontFamily: monoFont,
  },
  statLabel: {
    color: Colors.textDim,
    fontSize: 8,
    fontWeight: '500',
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  aceTracker: {
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
  },
  aceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  aceLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  aceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  aceBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  betBox: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#c9a84c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  betLabel: {
    color: Colors.textDim,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  betUnits: {
    fontSize: FontSize.xxl,
    fontWeight: '300',
    fontFamily: monoFont,
    marginRight: Spacing.md,
  },
  betDesc: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    flex: 1,
  },
  edgePill: {
    backgroundColor: Colors.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: Spacing.sm,
  },
  edgePillText: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  deviationAlert: {
    backgroundColor: Colors.surfaceLight,
    padding: Spacing.md,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    marginBottom: Spacing.md,
    shadowColor: '#e8d5a3',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  deviationTitle: {
    color: Colors.accent,
    fontSize: FontSize.md,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  deviationItem: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginLeft: Spacing.sm,
    marginBottom: 2,
  },
  deviationMore: {
    color: Colors.textDim,
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  cardGrid: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xs,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderTopWidth: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  cardButton: {
    flex: 1,
    maxWidth: 52,
    height: 56,
    backgroundColor: Colors.card,
    borderRadius: 6,
    borderWidth: 1,
    borderTopWidth: 1,
    borderTopColor: '#3a4a42',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  cardButtonExhausted: {
    opacity: 0.2,
    backgroundColor: Colors.surface,
    shadowOpacity: 0,
    elevation: 0,
  },
  cardLabel: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    fontFamily: monoFont,
  },
  cardLabelExhausted: {
    textDecorationLine: 'line-through',
  },
  cardRemaining: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  undoButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetButton: {
    backgroundColor: Colors.primaryDim,
  },
  actionText: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '600',
    letterSpacing: 1,
  },
  disabled: {
    opacity: 0.3,
  },
  csmBanner: {
    backgroundColor: Colors.danger + '20',
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  csmBannerText: {
    color: Colors.danger,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
