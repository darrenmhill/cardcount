import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../src/store/useStore';
import { Colors, Spacing, FontSize } from '../src/constants/theme';
import { COUNTING_SYSTEMS } from '../src/engine/countingSystems';
import { CountingSystemId, GameRules } from '../src/types';

const SYSTEM_IDS: CountingSystemId[] = [
  'hi-lo', 'hi-opt-i', 'hi-opt-ii', 'omega-ii', 'zen',
  'wong-halves', 'ko', 'red-7', 'ace-five',
];

const DECK_OPTIONS: GameRules['numDecks'][] = [1, 2, 4, 6, 8];

export default function SettingsScreen() {
  const { systemId, setSystem, rules, updateRules } = useStore();
  const [showSystemDetail, setShowSystemDetail] = useState<CountingSystemId | null>(null);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* CSM Warning */}
        {rules.csm && (
          <View style={styles.csmWarning}>
            <Text style={styles.csmWarningTitle}>CSM Active</Text>
            <Text style={styles.csmWarningText}>
              Continuous Shuffling Machine detected. Card counting is ineffective against CSMs — the deck is reshuffled after every hand. Consider finding a different table.
            </Text>
          </View>
        )}

        {/* Counting System Selection */}
        <Text style={styles.sectionTitle}>Counting System</Text>
        <View style={styles.systemGrid}>
          {SYSTEM_IDS.map(id => {
            const sys = COUNTING_SYSTEMS[id];
            const isSelected = id === systemId;
            return (
              <TouchableOpacity
                key={id}
                style={[styles.systemCard, isSelected && styles.systemCardSelected]}
                onPress={() => setSystem(id)}
                onLongPress={() => setShowSystemDetail(showSystemDetail === id ? null : id)}
              >
                <View style={styles.systemCardHeader}>
                  <Text style={[styles.systemCardName, isSelected && styles.systemCardNameSelected]}>
                    {sys.name}
                  </Text>
                  {isSelected && <View style={styles.selectedDot} />}
                </View>
                <View style={styles.systemCardMeta}>
                  <Text style={styles.systemCardTag}>
                    Lvl {sys.level}
                  </Text>
                  <Text style={styles.systemCardTag}>
                    {sys.balanced ? 'Balanced' : 'Unbalanced'}
                  </Text>
                  {sys.sideCountAces && (
                    <Text style={[styles.systemCardTag, styles.aceTag]}>Ace SC</Text>
                  )}
                </View>
                {showSystemDetail === id && (
                  <View style={styles.systemDetail}>
                    <Text style={styles.systemDetailText}>{sys.description}</Text>
                    <Text style={styles.systemDetailValues}>
                      Card values:{'\n'}
                      A:{sys.values['A']}  2:{sys.values['2']}  3:{sys.values['3']}  4:{sys.values['4']}  5:{sys.values['5']}{'\n'}
                      6:{sys.values['6']}  7:{sys.values['7']}  8:{sys.values['8']}  9:{sys.values['9']}  10:{sys.values['10']}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Number of Decks */}
        <Text style={styles.sectionTitle}>Number of Decks</Text>
        <View style={styles.optionRow}>
          {DECK_OPTIONS.map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.optionButton, rules.numDecks === n && styles.optionButtonActive]}
              onPress={() => updateRules({ numDecks: n })}
            >
              <Text style={[styles.optionText, rules.numDecks === n && styles.optionTextActive]}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Table Type */}
        <Text style={styles.sectionTitle}>Table Type</Text>
        <View style={styles.settingsGroup}>
          <SettingRow
            label="Continuous Shuffling Machine"
            value={rules.csm}
            onToggle={() => updateRules({ csm: !rules.csm })}
            description={rules.csm ? 'CSM in use — counting is NOT effective' : 'Standard shoe or hand-dealt'}
            warning={rules.csm}
          />
        </View>

        {/* Dealer Rules */}
        <Text style={styles.sectionTitle}>Dealer Rules</Text>
        <View style={styles.settingsGroup}>
          <SettingRow
            label="Dealer Hits Soft 17 (H17)"
            value={rules.dealerHitsSoft17}
            onToggle={() => updateRules({ dealerHitsSoft17: !rules.dealerHitsSoft17 })}
            description={rules.dealerHitsSoft17 ? 'Dealer hits on soft 17 (worse for player)' : 'Dealer stands on soft 17 (better for player)'}
          />
          <SettingRow
            label="Dealer Peeks for BJ"
            value={rules.dealerPeeks}
            onToggle={() => updateRules({ dealerPeeks: !rules.dealerPeeks })}
            description={rules.dealerPeeks ? 'American style — dealer checks for blackjack' : 'European style — no hole card (ENHC)'}
          />
          <SettingRow
            label="Original Bets Only (OBO)"
            value={rules.originalBetsOnly}
            onToggle={() => updateRules({ originalBetsOnly: !rules.originalBetsOnly })}
            description={rules.originalBetsOnly ? 'ENHC: only lose original bet to dealer BJ (not doubles/splits)' : 'Lose all bets (including doubles/splits) to dealer BJ'}
          />
        </View>
        {!rules.dealerPeeks && !rules.originalBetsOnly && (
          <Text style={styles.helpText}>
            Tip: Most European ENHC games use OBO. Without it, ENHC is significantly worse for the player.
          </Text>
        )}

        {/* Player Rules */}
        <Text style={styles.sectionTitle}>Player Rules</Text>
        <View style={styles.settingsGroup}>
          <SettingRow
            label="Double After Split (DAS)"
            value={rules.doubleAfterSplit}
            onToggle={() => updateRules({ doubleAfterSplit: !rules.doubleAfterSplit })}
            description="Can double down after splitting a pair"
          />
          <SettingRow
            label="Double After Hit"
            value={rules.doubleAfterHit}
            onToggle={() => updateRules({ doubleAfterHit: !rules.doubleAfterHit })}
            description="Can double after taking one or more hits (rare, some EU/Asia)"
          />
          <SettingRow
            label="Re-split Aces"
            value={rules.resplitAces}
            onToggle={() => updateRules({ resplitAces: !rules.resplitAces })}
            description="Can split aces again if dealt another ace"
          />
          <SettingRow
            label="Hit Split Aces"
            value={rules.hitSplitAces}
            onToggle={() => updateRules({ hitSplitAces: !rules.hitSplitAces })}
            description="Can take additional cards after splitting aces"
          />
        </View>

        {/* Max Split Hands */}
        <Text style={styles.sectionTitle}>Max Hands from Splits</Text>
        <View style={styles.optionRow}>
          {([2, 3, 4] as GameRules['maxSplitHands'][]).map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.optionButtonWide, rules.maxSplitHands === n && styles.optionButtonActive]}
              onPress={() => updateRules({ maxSplitHands: n })}
            >
              <Text style={[styles.optionText, rules.maxSplitHands === n && styles.optionTextActive]}>
                {n} hands
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.helpText}>
          Most casinos allow splitting to 4 hands. Some UK casinos limit to 2 (one split only).
        </Text>

        {/* Double On */}
        <Text style={styles.sectionTitle}>Double Down Allowed On</Text>
        <View style={styles.optionRow}>
          {(['any', '9-11', '10-11'] as GameRules['doubleOn'][]).map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.optionButtonWide, rules.doubleOn === opt && styles.optionButtonActive]}
              onPress={() => updateRules({ doubleOn: opt })}
            >
              <Text style={[styles.optionText, rules.doubleOn === opt && styles.optionTextActive]}>
                {opt === 'any' ? 'Any Two' : opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Surrender */}
        <Text style={styles.sectionTitle}>Surrender</Text>
        <View style={styles.optionRow}>
          {(['none', 'late', 'early'] as GameRules['surrenderAvailable'][]).map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.optionButtonWide, rules.surrenderAvailable === opt && styles.optionButtonActive]}
              onPress={() => updateRules({ surrenderAvailable: opt })}
            >
              <Text style={[styles.optionText, rules.surrenderAvailable === opt && styles.optionTextActive]}>
                {opt === 'none' ? 'None' : opt === 'late' ? 'Late' : 'Early'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Blackjack Payout */}
        <Text style={styles.sectionTitle}>Blackjack Payout</Text>
        <View style={styles.optionRow}>
          {(['3:2', '6:5', '1:1', '2:1'] as GameRules['blackjackPays'][]).map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.optionButtonWide, rules.blackjackPays === opt && styles.optionButtonActive]}
              onPress={() => updateRules({ blackjackPays: opt })}
            >
              <Text style={[styles.optionText, rules.blackjackPays === opt && styles.optionTextActive]}>
                {opt}
              </Text>
              {opt === '6:5' && rules.blackjackPays === opt && (
                <Text style={styles.warningText}>+1.39% edge</Text>
              )}
              {opt === '1:1' && rules.blackjackPays === opt && (
                <Text style={styles.warningText}>+2.27% edge</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.helpText}>
          3:2 is standard. 6:5 is common on single-deck. 2:1 is a bonus payout (very rare, some promotions).
        </Text>

        {/* BJ After Split Payout */}
        <Text style={styles.sectionTitle}>Blackjack After Split Pays</Text>
        <View style={styles.optionRow}>
          {(['1:1', '3:2'] as GameRules['bjAfterSplitPays'][]).map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.optionButtonWide, rules.bjAfterSplitPays === opt && styles.optionButtonActive]}
              onPress={() => updateRules({ bjAfterSplitPays: opt })}
            >
              <Text style={[styles.optionText, rules.bjAfterSplitPays === opt && styles.optionTextActive]}>
                {opt === '1:1' ? 'Even Money' : '3:2'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.helpText}>
          Almost all casinos pay even money for 21 after a split. A few pay full 3:2.
        </Text>

        {/* Charlie Rule */}
        <Text style={styles.sectionTitle}>Charlie Rule</Text>
        <View style={styles.optionRow}>
          {(['none', '5', '6', '7'] as GameRules['charlieRule'][]).map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.optionButtonWide, rules.charlieRule === opt && styles.optionButtonActive]}
              onPress={() => updateRules({ charlieRule: opt })}
            >
              <Text style={[styles.optionText, rules.charlieRule === opt && styles.optionTextActive]}>
                {opt === 'none' ? 'None' : `${opt}-Card`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.helpText}>
          Auto-win if you draw N cards without busting. Found in some UK and online casinos. 5-card charlie is most common.
        </Text>

        {/* Penetration */}
        <Text style={styles.sectionTitle}>Deck Penetration</Text>
        <View style={styles.optionRow}>
          {[0.5, 0.6, 0.67, 0.75, 0.8, 0.85].map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.optionButton, rules.penetration === p && styles.optionButtonActive]}
              onPress={() => updateRules({ penetration: p })}
            >
              <Text style={[styles.optionText, rules.penetration === p && styles.optionTextActive]}>
                {Math.round(p * 100)}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.helpText}>
          Typical: 75% (6-deck shoe), 60-67% (double deck), 50% (single deck)
        </Text>

        {/* Presets */}
        <Text style={styles.sectionTitle}>Casino Presets</Text>

        <Text style={styles.presetGroupTitle}>North America</Text>
        <View style={styles.presetsGrid}>
          <PresetButton
            name="Vegas Strip (Standard)"
            onPress={() => updateRules({
              numDecks: 6, dealerHitsSoft17: true, doubleAfterSplit: true,
              surrenderAvailable: 'late', doubleOn: 'any', blackjackPays: '3:2',
              dealerPeeks: true, originalBetsOnly: false, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
              doubleAfterHit: false, maxSplitHands: 4,
            })}
          />
          <PresetButton
            name="Vegas Strip (6:5)"
            onPress={() => updateRules({
              numDecks: 6, dealerHitsSoft17: true, doubleAfterSplit: true,
              surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '6:5',
              dealerPeeks: true, originalBetsOnly: false, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
              doubleAfterHit: false, maxSplitHands: 4,
            })}
          />
          <PresetButton
            name="Vegas Downtown"
            onPress={() => updateRules({
              numDecks: 2, dealerHitsSoft17: true, doubleAfterSplit: true,
              surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
              dealerPeeks: true, originalBetsOnly: false, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.6,
              doubleAfterHit: false, maxSplitHands: 4,
            })}
          />
          <PresetButton
            name="Single Deck (6:5)"
            onPress={() => updateRules({
              numDecks: 1, dealerHitsSoft17: true, doubleAfterSplit: false,
              surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '6:5',
              dealerPeeks: true, originalBetsOnly: false, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.5,
              doubleAfterHit: false, maxSplitHands: 4,
            })}
          />
          <PresetButton
            name="Atlantic City"
            onPress={() => updateRules({
              numDecks: 8, dealerHitsSoft17: false, doubleAfterSplit: true,
              surrenderAvailable: 'late', doubleOn: 'any', blackjackPays: '3:2',
              dealerPeeks: true, originalBetsOnly: false, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
              doubleAfterHit: false, maxSplitHands: 4,
            })}
          />
          <PresetButton
            name="Canadian Casino"
            onPress={() => updateRules({
              numDecks: 8, dealerHitsSoft17: false, doubleAfterSplit: true,
              surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
              dealerPeeks: true, originalBetsOnly: false, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
              doubleAfterHit: false, maxSplitHands: 4,
            })}
          />
        </View>

        <Text style={styles.presetGroupTitle}>United Kingdom</Text>
        <View style={styles.presetsGrid}>
          <PresetButton
            name="UK Casino (Standard)"
            onPress={() => updateRules({
              numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: true,
              surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
              dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
              doubleAfterHit: false, maxSplitHands: 2,
            })}
          />
          <PresetButton
            name="UK Casino (5-Card Charlie)"
            onPress={() => updateRules({
              numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: true,
              surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
              dealerPeeks: false, originalBetsOnly: true, charlieRule: '5',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
              doubleAfterHit: false, maxSplitHands: 2,
            })}
          />
          <PresetButton
            name="Grosvenor Casinos"
            onPress={() => updateRules({
              numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: true,
              surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
              dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.7,
              doubleAfterHit: false, maxSplitHands: 2,
            })}
          />
          <PresetButton
            name="Hippodrome London"
            onPress={() => updateRules({
              numDecks: 8, dealerHitsSoft17: false, doubleAfterSplit: true,
              surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
              dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
              doubleAfterHit: false, maxSplitHands: 2,
            })}
          />
        </View>

        <Text style={styles.presetGroupTitle}>Europe</Text>
        <View style={styles.presetsGrid}>
          <PresetButton
            name="European ENHC (Standard)"
            onPress={() => updateRules({
              numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: true,
              surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
              dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
              doubleAfterHit: false, maxSplitHands: 3,
            })}
          />
          <PresetButton
            name="Holland Casino"
            onPress={() => updateRules({
              numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: true,
              surrenderAvailable: 'none', doubleOn: '9-11', blackjackPays: '3:2',
              dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
              doubleAfterHit: false, maxSplitHands: 3,
            })}
          />
          <PresetButton
            name="German Casino"
            onPress={() => updateRules({
              numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: false,
              surrenderAvailable: 'none', doubleOn: '9-11', blackjackPays: '3:2',
              dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.7,
              doubleAfterHit: false, maxSplitHands: 3,
            })}
          />
          <PresetButton
            name="French Casino"
            onPress={() => updateRules({
              numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: true,
              surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
              dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
              doubleAfterHit: false, maxSplitHands: 2,
            })}
          />
          <PresetButton
            name="Spanish Casino"
            onPress={() => updateRules({
              numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: true,
              surrenderAvailable: 'late', doubleOn: 'any', blackjackPays: '3:2',
              dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
              doubleAfterHit: false, maxSplitHands: 3,
            })}
          />
          <PresetButton
            name="Czech / Eastern Europe"
            onPress={() => updateRules({
              numDecks: 6, dealerHitsSoft17: false, doubleAfterSplit: true,
              surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
              dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.7,
              doubleAfterHit: false, maxSplitHands: 4,
            })}
          />
        </View>

        <Text style={styles.presetGroupTitle}>Asia-Pacific</Text>
        <View style={styles.presetsGrid}>
          <PresetButton
            name="Macau (Standard)"
            onPress={() => updateRules({
              numDecks: 8, dealerHitsSoft17: false, doubleAfterSplit: true,
              surrenderAvailable: 'late', doubleOn: 'any', blackjackPays: '3:2',
              dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
              doubleAfterHit: false, maxSplitHands: 3,
            })}
          />
          <PresetButton
            name="Crown Melbourne"
            onPress={() => updateRules({
              numDecks: 8, dealerHitsSoft17: false, doubleAfterSplit: true,
              surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
              dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.75,
              doubleAfterHit: false, maxSplitHands: 3,
            })}
          />
          <PresetButton
            name="Marina Bay Sands"
            onPress={() => updateRules({
              numDecks: 8, dealerHitsSoft17: false, doubleAfterSplit: true,
              surrenderAvailable: 'late', doubleOn: 'any', blackjackPays: '3:2',
              dealerPeeks: false, originalBetsOnly: true, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.7,
              doubleAfterHit: false, maxSplitHands: 3,
            })}
          />
        </View>

        <Text style={styles.presetGroupTitle}>Special</Text>
        <View style={styles.presetsGrid}>
          <PresetButton
            name="Best Possible Rules"
            onPress={() => updateRules({
              numDecks: 1, dealerHitsSoft17: false, doubleAfterSplit: true,
              surrenderAvailable: 'early', doubleOn: 'any', blackjackPays: '3:2',
              dealerPeeks: true, originalBetsOnly: false, charlieRule: '5',
              bjAfterSplitPays: '3:2', csm: false, resplitAces: true,
              hitSplitAces: true, penetration: 0.85, doubleAfterHit: true,
              maxSplitHands: 4,
            })}
          />
          <PresetButton
            name="Worst Common Rules"
            onPress={() => updateRules({
              numDecks: 8, dealerHitsSoft17: true, doubleAfterSplit: false,
              surrenderAvailable: 'none', doubleOn: '10-11', blackjackPays: '6:5',
              dealerPeeks: false, originalBetsOnly: false, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, resplitAces: false,
              hitSplitAces: false, penetration: 0.5, doubleAfterHit: false,
              maxSplitHands: 2,
            })}
          />
          <PresetButton
            name="Online Casino (Typical)"
            onPress={() => updateRules({
              numDecks: 8, dealerHitsSoft17: false, doubleAfterSplit: true,
              surrenderAvailable: 'none', doubleOn: 'any', blackjackPays: '3:2',
              dealerPeeks: true, originalBetsOnly: false, charlieRule: 'none',
              bjAfterSplitPays: '1:1', csm: false, penetration: 0.5,
              doubleAfterHit: false, maxSplitHands: 4,
            })}
          />
        </View>

        <View style={{ height: Spacing.xxl * 2 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ label, value, onToggle, description, warning }: {
  label: string;
  value: boolean;
  onToggle: () => void;
  description: string;
  warning?: boolean;
}) {
  return (
    <View style={[styles.settingRow, warning && styles.settingRowWarning]}>
      <View style={styles.settingLeft}>
        <Text style={[styles.settingLabel, warning && styles.settingLabelWarning]}>{label}</Text>
        <Text style={styles.settingDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.card, true: warning ? Colors.danger + '80' : Colors.primaryDim }}
        thumbColor={value ? (warning ? Colors.danger : Colors.primary) : Colors.textDim}
      />
    </View>
  );
}

function PresetButton({ name, onPress }: { name: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.presetButton} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.presetText}>{name}</Text>
    </TouchableOpacity>
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
  csmWarning: {
    backgroundColor: Colors.danger + '20',
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  csmWarningTitle: {
    color: Colors.danger,
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  csmWarningText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  systemGrid: {
    gap: Spacing.sm,
  },
  systemCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  systemCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceLight,
  },
  systemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  systemCardName: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  systemCardNameSelected: {
    color: Colors.primary,
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  systemCardMeta: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  systemCardTag: {
    color: Colors.textDim,
    fontSize: FontSize.xs,
    backgroundColor: Colors.card,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  aceTag: {
    color: Colors.secondary,
    backgroundColor: Colors.secondary + '20',
  },
  systemDetail: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  systemDetailText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  systemDetailValues: {
    color: Colors.textDim,
    fontSize: FontSize.xs,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 50,
    alignItems: 'center',
  },
  optionButtonWide: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    flex: 1,
  },
  optionButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryDim + '30',
  },
  optionText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  optionTextActive: {
    color: Colors.primary,
  },
  warningText: {
    color: Colors.danger,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  settingsGroup: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingRowWarning: {
    backgroundColor: Colors.danger + '10',
  },
  settingLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  settingLabelWarning: {
    color: Colors.danger,
  },
  settingDesc: {
    color: Colors.textDim,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  helpText: {
    color: Colors.textDim,
    fontSize: FontSize.xs,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  presetGroupTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '600',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  presetButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.secondary + '40',
  },
  presetText: {
    color: Colors.secondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
