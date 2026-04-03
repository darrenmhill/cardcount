import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../src/store/useStore';
import { Colors, Spacing, FontSize } from '../src/constants/theme';
import {
  riskOfRuin, recommendedBankroll, optimalBetRamp, varianceSimulation, hourlyEV,
} from '../src/engine/bankroll';
import { calculateBaseHouseEdge } from '../src/engine/countingSystems';
import { calculatePerformanceStats, DrillResult } from '../src/engine/training';
import { Session, loadSessions, saveSessions, loadDrillResults } from '../src/store/sessions';
import { TrainContent } from './train';

type Tab = 'train' | 'sessions' | 'bankroll' | 'stats' | 'variance';

export default function OtherScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('train');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {([
          { key: 'train', label: 'Train' },
          { key: 'sessions', label: 'Sessions' },
          { key: 'bankroll', label: 'Bankroll' },
          { key: 'stats', label: 'Stats' },
          { key: 'variance', label: 'Variance' },
        ] as { key: Tab; label: string }[]).map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeTab === 'train' ? <TrainTab /> :
       activeTab === 'sessions' ? <SessionsTab /> :
       activeTab === 'bankroll' ? <BankrollTab /> :
       activeTab === 'stats' ? <StatsTab /> :
       <VarianceTab />}
    </SafeAreaView>
  );
}

function TrainTab() {
  return <TrainContent />;
}

// ---- Sessions Tab ----

function SessionsTab() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const { rules } = useStore();

  useEffect(() => { loadSessions().then(setSessions); }, []);

  const totalResult = sessions.reduce((s, r) => s + r.result, 0);
  const totalHours = sessions.reduce((s, r) => s + r.duration, 0) / 60;

  const addSession = async (session: Session) => {
    const updated = [session, ...sessions];
    setSessions(updated);
    await saveSessions(updated);
    setShowAdd(false);
  };

  const deleteSession = async (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    await saveSessions(updated);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryValue, { color: totalResult >= 0 ? Colors.positive : Colors.danger }]}>
            {totalResult >= 0 ? '+' : ''}{totalResult.toFixed(1)}
          </Text>
          <Text style={styles.summaryLabel}>Units P/L</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{sessions.length}</Text>
          <Text style={styles.summaryLabel}>Sessions</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{totalHours.toFixed(1)}h</Text>
          <Text style={styles.summaryLabel}>Total Time</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryValue, {
            color: totalHours > 0 ? (totalResult / totalHours >= 0 ? Colors.positive : Colors.danger) : Colors.textDim,
          }]}>
            {totalHours > 0 ? (totalResult / totalHours).toFixed(1) : '—'}
          </Text>
          <Text style={styles.summaryLabel}>Units/Hr</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
        <Text style={styles.addBtnText}>+ Log Session</Text>
      </TouchableOpacity>

      {sessions.length === 0 && (
        <Text style={styles.emptyText}>No sessions logged yet. Tap above to add your first.</Text>
      )}

      {sessions.map(s => (
        <TouchableOpacity
          key={s.id}
          style={styles.sessionCard}
          onLongPress={() => deleteSession(s.id)}
        >
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionCasino}>{s.casino || 'Unknown'}</Text>
            <Text style={[styles.sessionResult, {
              color: s.result >= 0 ? Colors.positive : Colors.danger,
            }]}>
              {s.result >= 0 ? '+' : ''}{s.result} units
            </Text>
          </View>
          <View style={styles.sessionMeta}>
            <Text style={styles.sessionMetaText}>
              {new Date(s.date).toLocaleDateString()} • {s.duration}min • {s.numDecks}D
            </Text>
            {s.conditions ? <Text style={styles.sessionMetaText}>{s.conditions}</Text> : null}
            {s.notes ? <Text style={styles.sessionNotes}>{s.notes}</Text> : null}
          </View>
        </TouchableOpacity>
      ))}

      <AddSessionModal
        visible={showAdd}
        rules={rules}
        onAdd={addSession}
        onCancel={() => setShowAdd(false)}
      />
    </ScrollView>
  );
}

function AddSessionModal({ visible, rules, onAdd, onCancel }: {
  visible: boolean; rules: any; onAdd: (s: Session) => void; onCancel: () => void;
}) {
  const [casino, setCasino] = useState('');
  const [result, setResult] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');

  const submit = () => {
    const session: Session = {
      id: Date.now().toString(),
      date: Date.now(),
      casino,
      duration: parseInt(duration) || 60,
      result: parseFloat(result) || 0,
      numDecks: rules.numDecks,
      notes,
      conditions: `${rules.dealerHitsSoft17 ? 'H17' : 'S17'} ${rules.doubleAfterSplit ? 'DAS' : ''} ${Math.round(rules.penetration * 100)}%`,
    };
    onAdd(session);
    setCasino(''); setResult(''); setDuration('60'); setNotes('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.modalCard} onPress={e => e.stopPropagation()}>
          <Text style={styles.modalTitle}>Log Session</Text>
          <TextInput style={styles.modalInput} placeholder="Casino name" placeholderTextColor={Colors.textDim}
            value={casino} onChangeText={setCasino} />
          <TextInput style={styles.modalInput} placeholder="Result (units, e.g. +15 or -8)" placeholderTextColor={Colors.textDim}
            value={result} onChangeText={setResult} keyboardType="numeric" />
          <TextInput style={styles.modalInput} placeholder="Duration (minutes)" placeholderTextColor={Colors.textDim}
            value={duration} onChangeText={setDuration} keyboardType="numeric" />
          <TextInput style={[styles.modalInput, { height: 60 }]} placeholder="Notes (optional)" placeholderTextColor={Colors.textDim}
            value={notes} onChangeText={setNotes} multiline />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSaveBtn} onPress={submit}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ---- Bankroll Tab ----

function BankrollTab() {
  const { rules } = useStore();
  const [bankroll, setBankroll] = useState('400');
  const [unitSize, setUnitSize] = useState('25');
  const [kellyPct, setKellyPct] = useState(50);
  const bankrollUnits = parseInt(bankroll) || 400;
  const unit = parseInt(unitSize) || 25;

  const baseEdge = calculateBaseHouseEdge(rules);
  const rec = recommendedBankroll(rules, 12);
  const ror = riskOfRuin(bankrollUnits, -baseEdge + 2 * 0.5);
  const ramp = optimalBetRamp(rules, bankrollUnits, kellyPct / 100);
  const hev = hourlyEV(-baseEdge + 1.5 * 0.5, unit * 3, 80);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Bankroll (units)</Text>
          <TextInput style={styles.inputField} value={bankroll} onChangeText={setBankroll}
            keyboardType="numeric" placeholderTextColor={Colors.textDim} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Unit size ($)</Text>
          <TextInput style={styles.inputField} value={unitSize} onChangeText={setUnitSize}
            keyboardType="numeric" placeholderTextColor={Colors.textDim} />
        </View>
      </View>

      <Text style={styles.inputLabel}>Kelly fraction</Text>
      <View style={styles.optRow}>
        {[25, 50, 75, 100].map(k => (
          <TouchableOpacity key={k}
            style={[styles.optBtn, kellyPct === k && styles.optBtnActive]}
            onPress={() => setKellyPct(k)}
          >
            <Text style={[styles.optText, kellyPct === k && styles.optTextActive]}>{k}%</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      <View style={styles.resultBox}>
        <ResultRow label="Risk of Ruin" value={`${(ror * 100).toFixed(2)}%`}
          color={ror < 0.05 ? Colors.positive : ror < 0.15 ? Colors.accent : Colors.danger} />
        <ResultRow label="Recommended Bankroll" value={`${rec.units} units ($${(rec.units * unit).toLocaleString()})`} />
        <ResultRow label="Base House Edge" value={`${baseEdge.toFixed(2)}%`} color={Colors.danger} />
        <ResultRow label="Est. Hourly EV" value={`$${hev.toFixed(0)}/hr`}
          color={hev > 0 ? Colors.positive : Colors.danger} />
        <ResultRow label="Bankroll" value={`$${(bankrollUnits * unit).toLocaleString()}`} />
      </View>

      {/* Optimal Bet Ramp */}
      <Text style={styles.sectionTitle}>Optimal Bet Ramp ({kellyPct}% Kelly)</Text>
      <View style={styles.rampTable}>
        <View style={styles.rampHeader}>
          <Text style={[styles.rampCell, styles.rampHeaderText]}>TC</Text>
          <Text style={[styles.rampCell, styles.rampHeaderText]}>Units</Text>
          <Text style={[styles.rampCell, styles.rampHeaderText]}>Bet $</Text>
          <Text style={[styles.rampCell, styles.rampHeaderText]}>Edge</Text>
        </View>
        {ramp.filter(r => r.tc >= -2).map(r => (
          <View key={r.tc} style={[styles.rampRow, r.edge > 0 && styles.rampRowPositive]}>
            <Text style={styles.rampCell}>{r.tc > 0 ? '+' : ''}{r.tc}</Text>
            <Text style={[styles.rampCell, { fontWeight: '700' }]}>{r.units}</Text>
            <Text style={styles.rampCell}>${r.units * unit}</Text>
            <Text style={[styles.rampCell, { color: r.edge > 0 ? Colors.positive : Colors.danger }]}>
              {r.edge > 0 ? '+' : ''}{r.edge.toFixed(2)}%
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function ResultRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={[styles.resultValue, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

// ---- Stats Tab ----

function StatsTab() {
  const [results, setResults] = useState<DrillResult[]>([]);

  useEffect(() => { loadDrillResults().then(setResults); }, []);

  const stats = useMemo(() => calculatePerformanceStats(results), [results]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Training Performance</Text>

      {stats.totalDrills === 0 ? (
        <Text style={styles.emptyText}>No drill results yet. Complete drills in the Train tab to see stats.</Text>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryValue}>{stats.totalDrills}</Text>
              <Text style={styles.summaryLabel}>Drills</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={[styles.summaryValue, {
                color: stats.accuracy >= 80 ? Colors.positive : stats.accuracy >= 60 ? Colors.accent : Colors.danger,
              }]}>{stats.accuracy.toFixed(0)}%</Text>
              <Text style={styles.summaryLabel}>Accuracy</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryValue}>{stats.totalCorrect}/{stats.totalQuestions}</Text>
              <Text style={styles.summaryLabel}>Correct</Text>
            </View>
          </View>

          {/* Per-type breakdown */}
          <Text style={styles.sectionTitle}>By Drill Type</Text>
          {Object.entries(stats.byType).map(([type, data]) => (
            <View key={type} style={styles.typeRow}>
              <Text style={styles.typeName}>
                {type === 'speed' ? 'Speed Counting' : type === 'strategy' ? 'Basic Strategy' :
                 type === 'deviation' ? 'Deviations' : 'TC Conversion'}
              </Text>
              <View style={styles.typeBarBg}>
                <View style={[styles.typeBarFill, {
                  width: `${data.accuracy}%`,
                  backgroundColor: data.accuracy >= 80 ? Colors.positive : data.accuracy >= 60 ? Colors.accent : Colors.danger,
                }]} />
              </View>
              <Text style={styles.typeAccuracy}>{data.accuracy.toFixed(0)}%</Text>
            </View>
          ))}

          {/* Recent results */}
          <Text style={styles.sectionTitle}>Recent Drills</Text>
          {stats.recentResults.slice().reverse().slice(0, 10).map((r, i) => (
            <View key={i} style={styles.recentRow}>
              <Text style={styles.recentType}>
                {r.type === 'speed' ? 'Speed' : r.type === 'strategy' ? 'Strategy' :
                 r.type === 'deviation' ? 'Deviation' : 'TC Conv.'}
              </Text>
              <Text style={styles.recentScore}>{r.correct}/{r.total}</Text>
              <Text style={[styles.recentAccuracy, {
                color: r.correct / r.total >= 0.8 ? Colors.positive : Colors.danger,
              }]}>{(r.correct / r.total * 100).toFixed(0)}%</Text>
              <Text style={styles.recentTime}>{(r.durationMs / 1000).toFixed(0)}s</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

// ---- Variance Tab ----

function VarianceTab() {
  const { rules } = useStore();
  const [hands, setHands] = useState(1000);
  const [avgBet, setAvgBet] = useState(4);

  const baseEdge = calculateBaseHouseEdge(rules);
  const avgEdge = -baseEdge + 1.5 * 0.5; // assume avg TC +1.5 while playing
  const simData = useMemo(
    () => varianceSimulation(avgEdge, avgBet, hands),
    [avgEdge, avgBet, hands],
  );

  const maxVal = Math.max(...simData.map(d => Math.abs(d.p95)), ...simData.map(d => Math.abs(d.p5)));
  const chartHeight = 200;

  const toY = (val: number) => {
    return chartHeight / 2 - (val / (maxVal || 1)) * (chartHeight / 2);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Variance Simulator</Text>
      <Text style={styles.helpText}>
        Projected bankroll trajectories over {hands} hands at avg {avgBet} unit bet.
      </Text>

      <View style={styles.optRow}>
        {[500, 1000, 2500, 5000, 10000].map(h => (
          <TouchableOpacity key={h}
            style={[styles.optBtn, hands === h && styles.optBtnActive]}
            onPress={() => setHands(h)}
          >
            <Text style={[styles.optText, hands === h && styles.optTextActive]}>{h >= 1000 ? `${h/1000}K` : h}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ASCII-style fan chart */}
      <View style={[styles.chart, { height: chartHeight }]}>
        {/* Zero line */}
        <View style={[styles.chartLine, { top: chartHeight / 2 }]} />

        {/* Bands */}
        {simData.map((d, i) => {
          if (i === 0) return null;
          const x = (i / simData.length) * 100;
          const w = (1 / simData.length) * 100;
          return (
            <View key={i} style={{ position: 'absolute', left: `${x - w}%`, width: `${w + 0.5}%` }}>
              {/* 5-95 band */}
              <View style={{
                position: 'absolute',
                top: toY(d.p95),
                height: Math.max(1, toY(d.p5) - toY(d.p95)),
                width: '100%',
                backgroundColor: Colors.primary + '15',
              }} />
              {/* 25-75 band */}
              <View style={{
                position: 'absolute',
                top: toY(d.p75),
                height: Math.max(1, toY(d.p25) - toY(d.p75)),
                width: '100%',
                backgroundColor: Colors.primary + '30',
              }} />
              {/* Median line dot */}
              <View style={{
                position: 'absolute',
                top: toY(d.p50) - 1,
                height: 2,
                width: '100%',
                backgroundColor: Colors.primary,
              }} />
            </View>
          );
        })}

        {/* Labels */}
        <Text style={[styles.chartLabel, { top: 4 }]}>
          +{maxVal.toFixed(0)}u
        </Text>
        <Text style={[styles.chartLabel, { bottom: 4 }]}>
          -{maxVal.toFixed(0)}u
        </Text>
      </View>

      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendLabel}>Median (50th)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: Colors.primary + '30' }]} />
          <Text style={styles.legendLabel}>25th-75th</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: Colors.primary + '15' }]} />
          <Text style={styles.legendLabel}>5th-95th</Text>
        </View>
      </View>

      {/* Key stats */}
      <View style={styles.resultBox}>
        <ResultRow label="Expected Value" value={`${simData[simData.length - 1]?.p50.toFixed(1) ?? 0} units`}
          color={Colors.positive} />
        <ResultRow label="95th percentile" value={`+${simData[simData.length - 1]?.p95.toFixed(1) ?? 0} units`}
          color={Colors.positive} />
        <ResultRow label="5th percentile" value={`${simData[simData.length - 1]?.p5.toFixed(1) ?? 0} units`}
          color={Colors.danger} />
        <ResultRow label="Avg Edge" value={`${avgEdge.toFixed(2)}%`} />
      </View>
    </ScrollView>
  );
}

// ---- Styles ----

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabBar: {
    backgroundColor: Colors.surface, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border, flexGrow: 0,
  },
  tab: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: 8, marginRight: Spacing.sm },
  tabActive: { backgroundColor: Colors.primaryDim },
  tabText: { color: Colors.textDim, fontSize: FontSize.md, fontWeight: '600' },
  tabTextActive: { color: Colors.text },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg },

  summaryRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing.lg },
  summaryBox: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 8,
    padding: Spacing.md, alignItems: 'center',
  },
  summaryValue: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '800', fontVariant: ['tabular-nums'] },
  summaryLabel: { color: Colors.textDim, fontSize: 9, fontWeight: '600', marginTop: 2, textTransform: 'uppercase' },

  addBtn: {
    backgroundColor: Colors.primaryDim, padding: Spacing.md, borderRadius: 10,
    alignItems: 'center', marginBottom: Spacing.lg,
  },
  addBtnText: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },

  emptyText: { color: Colors.textDim, fontSize: FontSize.md, textAlign: 'center', marginTop: Spacing.xxl },

  sessionCard: {
    backgroundColor: Colors.surface, borderRadius: 10, padding: Spacing.md,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sessionCasino: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },
  sessionResult: { fontSize: FontSize.md, fontWeight: '800', fontVariant: ['tabular-nums'] },
  sessionMeta: {},
  sessionMetaText: { color: Colors.textDim, fontSize: FontSize.xs },
  sessionNotes: { color: Colors.textSecondary, fontSize: FontSize.xs, marginTop: 4, fontStyle: 'italic' },

  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center',
    alignItems: 'center', padding: Spacing.xl,
  },
  modalCard: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: Spacing.xl,
    maxWidth: 360, width: '100%', borderWidth: 1, borderColor: Colors.border,
  },
  modalTitle: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800', marginBottom: Spacing.lg },
  modalInput: {
    backgroundColor: Colors.card, color: Colors.text, fontSize: FontSize.md,
    padding: Spacing.md, borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  modalActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  modalCancelBtn: { flex: 1, padding: Spacing.md, borderRadius: 8, backgroundColor: Colors.surfaceLight, alignItems: 'center' },
  modalCancelText: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600' },
  modalSaveBtn: { flex: 1, padding: Spacing.md, borderRadius: 8, backgroundColor: Colors.primaryDim, alignItems: 'center' },
  modalSaveText: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700' },

  inputRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  inputGroup: { flex: 1 },
  inputLabel: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.xs },
  inputField: {
    backgroundColor: Colors.surface, color: Colors.text, fontSize: FontSize.lg, fontWeight: '700',
    padding: Spacing.md, borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
    textAlign: 'center', fontVariant: ['tabular-nums'],
  },
  optRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  optBtn: {
    backgroundColor: Colors.surface, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
  },
  optBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryDim + '30' },
  optText: { color: Colors.textSecondary, fontSize: FontSize.sm, fontWeight: '600' },
  optTextActive: { color: Colors.primary },

  resultBox: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.md,
    marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  resultLabel: { color: Colors.textSecondary, fontSize: FontSize.sm },
  resultValue: { color: Colors.text, fontSize: FontSize.md, fontWeight: '700', fontVariant: ['tabular-nums'] },

  sectionTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700', marginBottom: Spacing.md, marginTop: Spacing.md },
  helpText: { color: Colors.textDim, fontSize: FontSize.sm, marginBottom: Spacing.md },

  rampTable: { backgroundColor: Colors.surface, borderRadius: 10, overflow: 'hidden', marginBottom: Spacing.lg },
  rampHeader: {
    flexDirection: 'row', backgroundColor: Colors.surfaceLight, paddingVertical: Spacing.sm,
  },
  rampHeaderText: { color: Colors.textSecondary, fontWeight: '700', fontSize: FontSize.xs },
  rampRow: { flexDirection: 'row', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rampRowPositive: { backgroundColor: Colors.positive + '08' },
  rampCell: { flex: 1, textAlign: 'center', color: Colors.text, fontSize: FontSize.sm, fontVariant: ['tabular-nums'] },

  typeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm },
  typeName: { color: Colors.textSecondary, fontSize: FontSize.sm, width: 100 },
  typeBarBg: { flex: 1, height: 8, backgroundColor: Colors.card, borderRadius: 4, overflow: 'hidden' },
  typeBarFill: { height: '100%', borderRadius: 4 },
  typeAccuracy: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '700', width: 40, textAlign: 'right' },

  recentRow: {
    flexDirection: 'row', paddingVertical: Spacing.sm, borderBottomWidth: 1,
    borderBottomColor: Colors.border, alignItems: 'center',
  },
  recentType: { color: Colors.textSecondary, fontSize: FontSize.sm, flex: 1 },
  recentScore: { color: Colors.text, fontSize: FontSize.sm, fontWeight: '600', width: 50, textAlign: 'center' },
  recentAccuracy: { fontSize: FontSize.sm, fontWeight: '700', width: 45, textAlign: 'center' },
  recentTime: { color: Colors.textDim, fontSize: FontSize.sm, width: 40, textAlign: 'right' },

  chart: {
    backgroundColor: Colors.surface, borderRadius: 12, marginBottom: Spacing.md,
    overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: Colors.border,
  },
  chartLine: {
    position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: Colors.textDim + '30',
  },
  chartLabel: { position: 'absolute', right: 8, color: Colors.textDim, fontSize: 9 },
  chartLegend: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.lg, marginBottom: Spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendBox: { width: 12, height: 12, borderRadius: 2, marginRight: 4 },
  legendLabel: { color: Colors.textSecondary, fontSize: FontSize.xs },
});
