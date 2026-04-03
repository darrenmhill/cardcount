import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../src/store/useStore';
import { Colors, Spacing, FontSize } from '../src/constants/theme';
import { COUNTING_SYSTEMS } from '../src/engine/countingSystems';
import { getActionColor, getActionName } from '../src/engine/basicStrategy';
import {
  randomCard, correctRunningCount, generateStrategyQuestion,
  generateDeviationQuestion, generateTCQuestion,
  DrillResult, StrategyQuestion, DeviationQuestion, TCConversionQuestion,
} from '../src/engine/training';
import { loadDrillResults, saveDrillResults } from '../src/store/sessions';
import { Card, Action, CountingSystemId } from '../src/types';

type DrillType = 'menu' | 'speed' | 'strategy' | 'deviation' | 'tc';

export default function TrainScreen() {
  const { systemId, rules } = useStore();
  const [drill, setDrill] = useState<DrillType>('menu');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {drill === 'menu' ? (
        <DrillMenu onSelect={setDrill} />
      ) : drill === 'speed' ? (
        <SpeedDrill systemId={systemId} onBack={() => setDrill('menu')} />
      ) : drill === 'strategy' ? (
        <StrategyDrill rules={rules} onBack={() => setDrill('menu')} />
      ) : drill === 'deviation' ? (
        <DeviationDrill rules={rules} systemId={systemId} onBack={() => setDrill('menu')} />
      ) : drill === 'tc' ? (
        <TCDrill onBack={() => setDrill('menu')} />
      ) : null}
    </SafeAreaView>
  );
}

// ---- Drill Menu ----

function DrillMenu({ onSelect }: { onSelect: (d: DrillType) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.menuContent}>
      <Text style={styles.menuTitle}>Training Drills</Text>
      <Text style={styles.menuSubtitle}>Build speed and accuracy for real casino play</Text>

      <DrillCard
        title="Speed Counting"
        desc="Cards flash on screen. Keep the running count and enter it when prompted."
        emoji="🔢"
        onPress={() => onSelect('speed')}
      />
      <DrillCard
        title="Basic Strategy"
        desc="Shown a hand and dealer upcard — pick the correct action. Builds instant recall."
        emoji="📊"
        onPress={() => onSelect('strategy')}
      />
      <DrillCard
        title="Deviation Decisions"
        desc="Hand, dealer card, and true count — decide whether to deviate from basic strategy."
        emoji="⚡"
        onPress={() => onSelect('deviation')}
      />
      <DrillCard
        title="True Count Conversion"
        desc="Given running count and decks remaining, calculate the true count."
        emoji="🧮"
        onPress={() => onSelect('tc')}
      />
    </ScrollView>
  );
}

function DrillCard({ title, desc, emoji, onPress }: {
  title: string; desc: string; emoji: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.drillCard} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.drillEmoji}>{emoji}</Text>
      <View style={styles.drillInfo}>
        <Text style={styles.drillTitle}>{title}</Text>
        <Text style={styles.drillDesc}>{desc}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ---- Speed Counting Drill ----

function SpeedDrill({ systemId, onBack }: { systemId: CountingSystemId; onBack: () => void }) {
  const system = COUNTING_SYSTEMS[systemId];
  const [phase, setPhase] = useState<'setup' | 'running' | 'answer' | 'result'>('setup');
  const [speed, setSpeed] = useState(1500); // ms per card
  const [cardCount, setCardCount] = useState(20);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startDrill = () => {
    const newCards = Array.from({ length: cardCount }, () => randomCard());
    setCards(newCards);
    setCurrentIdx(0);
    setCorrectAnswer(correctRunningCount(newCards, systemId as any));
    setStartTime(Date.now());
    setPhase('running');
  };

  useEffect(() => {
    if (phase === 'running' && currentIdx < cards.length) {
      timerRef.current = setTimeout(() => {
        setCurrentIdx(i => i + 1);
      }, speed);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    } else if (phase === 'running' && currentIdx >= cards.length) {
      setPhase('answer');
    }
  }, [phase, currentIdx, cards.length, speed]);

  const submitAnswer = () => {
    const parsed = parseFloat(userAnswer);
    if (isNaN(parsed)) return;
    const correct = parsed === correctAnswer ? 1 : 0;
    const result: DrillResult = {
      type: 'speed',
      timestamp: Date.now(),
      correct,
      total: 1,
      durationMs: Date.now() - startTime,
    };
    saveDrillResult(result);
    setPhase('result');
  };

  const getCardColor = (card: Card): string => {
    const val = system.values[card];
    return val > 0 ? Colors.positive : val < 0 ? Colors.negative : Colors.textDim;
  };

  return (
    <View style={styles.drillContainer}>
      <DrillHeader title="Speed Counting" subtitle={system.name} onBack={onBack} />

      {phase === 'setup' && (
        <View style={styles.setupContainer}>
          <Text style={styles.setupLabel}>Cards per round</Text>
          <View style={styles.optRow}>
            {[10, 15, 20, 30, 52].map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.optBtn, cardCount === n && styles.optBtnActive]}
                onPress={() => setCardCount(n)}
              >
                <Text style={[styles.optText, cardCount === n && styles.optTextActive]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.setupLabel}>Speed</Text>
          <View style={styles.optRow}>
            {[
              { label: 'Slow', ms: 2500 },
              { label: 'Normal', ms: 1500 },
              { label: 'Fast', ms: 900 },
              { label: 'Dealer', ms: 600 },
            ].map(s => (
              <TouchableOpacity
                key={s.label}
                style={[styles.optBtn, speed === s.ms && styles.optBtnActive]}
                onPress={() => setSpeed(s.ms)}
              >
                <Text style={[styles.optText, speed === s.ms && styles.optTextActive]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.startBtn} onPress={startDrill}>
            <Text style={styles.startBtnText}>Start</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'running' && currentIdx < cards.length && (
        <View style={styles.flashContainer}>
          <Text style={styles.flashProgress}>{currentIdx + 1} / {cards.length}</Text>
          <Text style={[styles.flashCard, { color: getCardColor(cards[currentIdx]) }]}>
            {cards[currentIdx]}
          </Text>
          <Text style={styles.flashHint}>Keep counting...</Text>
        </View>
      )}

      {phase === 'answer' && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerPrompt}>What is the running count?</Text>
          <TextInput
            style={styles.answerInput}
            value={userAnswer}
            onChangeText={setUserAnswer}
            keyboardType="numeric"
            autoFocus
            placeholderTextColor={Colors.textDim}
            placeholder="Enter RC..."
            onSubmitEditing={submitAnswer}
          />
          <TouchableOpacity style={styles.startBtn} onPress={submitAnswer}>
            <Text style={styles.startBtnText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'result' && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultEmoji}>
            {parseFloat(userAnswer) === correctAnswer ? '✓' : '✗'}
          </Text>
          <Text style={[styles.resultTitle, {
            color: parseFloat(userAnswer) === correctAnswer ? Colors.positive : Colors.danger,
          }]}>
            {parseFloat(userAnswer) === correctAnswer ? 'Correct!' : 'Incorrect'}
          </Text>
          <Text style={styles.resultDetail}>
            Your answer: {userAnswer}  |  Correct: {correctAnswer}
          </Text>
          <Text style={styles.resultDetail}>
            Time: {((Date.now() - startTime) / 1000).toFixed(1)}s for {cardCount} cards
          </Text>
          <View style={styles.resultActions}>
            <TouchableOpacity style={[styles.optBtn, { flex: 1 }]} onPress={onBack}>
              <Text style={styles.optText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.startBtn, { flex: 1 }]} onPress={() => { setUserAnswer(''); startDrill(); }}>
              <Text style={styles.startBtnText}>Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ---- Strategy Drill ----

function StrategyDrill({ rules, onBack }: { rules: any; onBack: () => void }) {
  const [question, setQuestion] = useState<StrategyQuestion | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [startTime] = useState(Date.now());

  useEffect(() => { setQuestion(generateStrategyQuestion(rules)); }, []);

  const answer = (action: Action) => {
    if (!question || feedback) return;
    const isCorrect = action === question.correctAction;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    setTimeout(() => {
      setFeedback(null);
      setQuestion(generateStrategyQuestion(rules));
    }, isCorrect ? 600 : 1500);
  };

  const finish = () => {
    if (score.total > 0) {
      saveDrillResult({
        type: 'strategy', timestamp: Date.now(),
        correct: score.correct, total: score.total,
        durationMs: Date.now() - startTime,
      });
    }
    onBack();
  };

  const actions: Action[] = ['H', 'S', 'Dh', 'P', 'Rh'];

  return (
    <View style={styles.drillContainer}>
      <DrillHeader title="Basic Strategy" subtitle={`${score.correct}/${score.total}`} onBack={finish} />
      {question && (
        <View style={styles.quizContainer}>
          <View style={styles.handDisplay}>
            <View style={styles.handCard}>
              <Text style={styles.handCardLabel}>YOU</Text>
              <Text style={styles.handCardValue}>{question.playerTotal}</Text>
              <Text style={styles.handCardType}>
                {question.handType === 'pair' ? 'Pair' : question.handType === 'soft' ? 'Soft' : 'Hard'}
              </Text>
            </View>
            <Text style={styles.vsText}>vs</Text>
            <View style={styles.handCard}>
              <Text style={styles.handCardLabel}>DEALER</Text>
              <Text style={styles.handCardValue}>{question.dealerUpcard}</Text>
            </View>
          </View>

          {feedback && (
            <View style={[styles.feedbackBanner, {
              backgroundColor: feedback === 'correct' ? Colors.positive + '20' : Colors.danger + '20',
            }]}>
              <Text style={[styles.feedbackText, {
                color: feedback === 'correct' ? Colors.positive : Colors.danger,
              }]}>
                {feedback === 'correct' ? 'Correct!' : `Wrong — ${getActionName(question.correctAction)}`}
              </Text>
            </View>
          )}

          <View style={styles.actionGrid}>
            {actions.map(a => (
              <TouchableOpacity
                key={a}
                style={[styles.actionBtn, { backgroundColor: getActionColor(a) + '20', borderColor: getActionColor(a) }]}
                onPress={() => answer(a)}
              >
                <Text style={[styles.actionBtnText, { color: getActionColor(a) }]}>{getActionName(a)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ---- Deviation Drill ----

function DeviationDrill({ rules, systemId, onBack }: { rules: any; systemId: string; onBack: () => void }) {
  const [question, setQuestion] = useState<DeviationQuestion | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [startTime] = useState(Date.now());

  const nextQuestion = useCallback(() => {
    setQuestion(generateDeviationQuestion(rules, systemId as any));
  }, [rules, systemId]);

  useEffect(() => { nextQuestion(); }, []);

  const answer = (action: Action) => {
    if (!question || feedback) return;
    const isCorrect = action === question.correctAction;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    setTimeout(() => {
      setFeedback(null);
      nextQuestion();
    }, isCorrect ? 600 : 2000);
  };

  const finish = () => {
    if (score.total > 0) {
      saveDrillResult({
        type: 'deviation', timestamp: Date.now(),
        correct: score.correct, total: score.total,
        durationMs: Date.now() - startTime,
      });
    }
    onBack();
  };

  return (
    <View style={styles.drillContainer}>
      <DrillHeader title="Deviation Decisions" subtitle={`${score.correct}/${score.total}`} onBack={finish} />
      {question && (
        <View style={styles.quizContainer}>
          <View style={styles.handDisplay}>
            <View style={styles.handCard}>
              <Text style={styles.handCardLabel}>YOU</Text>
              <Text style={styles.handCardValue}>{question.playerHand}</Text>
            </View>
            <Text style={styles.vsText}>vs</Text>
            <View style={styles.handCard}>
              <Text style={styles.handCardLabel}>DEALER</Text>
              <Text style={styles.handCardValue}>{question.dealerUpcard}</Text>
            </View>
          </View>

          <View style={styles.tcBadge}>
            <Text style={styles.tcBadgeLabel}>TC</Text>
            <Text style={[styles.tcBadgeValue, {
              color: question.trueCount > 0 ? Colors.positive : question.trueCount < 0 ? Colors.negative : Colors.neutral,
            }]}>
              {question.trueCount > 0 ? '+' : ''}{question.trueCount}
            </Text>
          </View>

          <Text style={styles.deviationHint}>
            Basic strategy: {getActionName(question.normalAction)}. Deviate?
          </Text>

          {feedback && (
            <View style={[styles.feedbackBanner, {
              backgroundColor: feedback === 'correct' ? Colors.positive + '20' : Colors.danger + '20',
            }]}>
              <Text style={[styles.feedbackText, {
                color: feedback === 'correct' ? Colors.positive : Colors.danger,
              }]}>
                {feedback === 'correct' ? 'Correct!' : `Wrong — should ${question.shouldDeviate ? 'deviate' : 'use basic strategy'}: ${getActionName(question.correctAction)}`}
              </Text>
            </View>
          )}

          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.hit + '20', borderColor: Colors.hit, flex: 1 }]}
              onPress={() => answer(question.normalAction)}
            >
              <Text style={[styles.actionBtnText, { color: Colors.hit }]}>Basic: {question.normalAction}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.accent + '20', borderColor: Colors.accent, flex: 1 }]}
              onPress={() => answer(question.shouldDeviate ? question.correctAction : question.normalAction)}
            >
              <Text style={[styles.actionBtnText, { color: Colors.accent }]}>
                {question.shouldDeviate ? `Deviate: ${question.correctAction}` : `Basic: ${question.normalAction}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ---- TC Conversion Drill ----

function TCDrill({ onBack }: { onBack: () => void }) {
  const [question, setQuestion] = useState<TCConversionQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [startTime] = useState(Date.now());

  useEffect(() => { setQuestion(generateTCQuestion()); }, []);

  const submit = () => {
    if (!question) return;
    const parsed = parseFloat(userAnswer);
    if (isNaN(parsed)) return;
    // Accept within 0.5 of correct answer
    const isCorrect = Math.abs(parsed - question.correctTC) <= 0.5;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
    setTimeout(() => {
      setFeedback(null);
      setUserAnswer('');
      setQuestion(generateTCQuestion());
    }, isCorrect ? 600 : 1500);
  };

  const finish = () => {
    if (score.total > 0) {
      saveDrillResult({
        type: 'tc-conversion', timestamp: Date.now(),
        correct: score.correct, total: score.total,
        durationMs: Date.now() - startTime,
      });
    }
    onBack();
  };

  return (
    <View style={styles.drillContainer}>
      <DrillHeader title="TC Conversion" subtitle={`${score.correct}/${score.total}`} onBack={finish} />
      {question && (
        <View style={styles.quizContainer}>
          <View style={styles.tcQuestionBox}>
            <View style={styles.tcQRow}>
              <Text style={styles.tcQLabel}>Running Count:</Text>
              <Text style={styles.tcQValue}>
                {question.runningCount > 0 ? '+' : ''}{question.runningCount}
              </Text>
            </View>
            <View style={styles.tcQRow}>
              <Text style={styles.tcQLabel}>Decks Remaining:</Text>
              <Text style={styles.tcQValue}>{question.decksRemaining}</Text>
            </View>
          </View>

          <Text style={styles.answerPrompt}>True Count = ?</Text>

          {feedback && (
            <View style={[styles.feedbackBanner, {
              backgroundColor: feedback === 'correct' ? Colors.positive + '20' : Colors.danger + '20',
            }]}>
              <Text style={[styles.feedbackText, {
                color: feedback === 'correct' ? Colors.positive : Colors.danger,
              }]}>
                {feedback === 'correct'
                  ? 'Correct!'
                  : `Answer: ${question.correctTC > 0 ? '+' : ''}${question.correctTC} (${question.runningCount} / ${question.decksRemaining})`
                }
              </Text>
            </View>
          )}

          <TextInput
            style={styles.answerInput}
            value={userAnswer}
            onChangeText={setUserAnswer}
            keyboardType="numeric"
            autoFocus
            placeholderTextColor={Colors.textDim}
            placeholder="Enter TC..."
            onSubmitEditing={submit}
          />
          <TouchableOpacity style={styles.startBtn} onPress={submit}>
            <Text style={styles.startBtnText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ---- Shared Components ----

function DrillHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return (
    <View style={styles.drillHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backBtnText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.drillHeaderCenter}>
        <Text style={styles.drillHeaderTitle}>{title}</Text>
        <Text style={styles.drillHeaderSub}>{subtitle}</Text>
      </View>
      <View style={{ width: 50 }} />
    </View>
  );
}

async function saveDrillResult(result: DrillResult) {
  try {
    const existing = await loadDrillResults();
    existing.push(result);
    // Keep last 200
    await saveDrillResults(existing.slice(-200));
  } catch {}
}

// ---- Styles ----

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  menuContent: { padding: Spacing.lg },
  menuTitle: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '800', marginBottom: Spacing.xs },
  menuSubtitle: { color: Colors.textSecondary, fontSize: FontSize.md, marginBottom: Spacing.xl },
  drillCard: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.lg,
    marginBottom: Spacing.md, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  drillEmoji: { fontSize: 32, marginRight: Spacing.lg },
  drillInfo: { flex: 1 },
  drillTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  drillDesc: { color: Colors.textSecondary, fontSize: FontSize.sm, marginTop: 4, lineHeight: 20 },

  drillContainer: { flex: 1 },
  drillHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 50 },
  backBtnText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '600' },
  drillHeaderCenter: { alignItems: 'center' },
  drillHeaderTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  drillHeaderSub: { color: Colors.textSecondary, fontSize: FontSize.sm },

  setupContainer: { padding: Spacing.xl, flex: 1, justifyContent: 'center' },
  setupLabel: {
    color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600',
    marginBottom: Spacing.sm, marginTop: Spacing.lg,
  },
  optRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  optBtn: {
    backgroundColor: Colors.surface, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderRadius: 8, borderWidth: 1, borderColor: Colors.border,
  },
  optBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryDim + '30' },
  optText: { color: Colors.textSecondary, fontSize: FontSize.md, fontWeight: '600' },
  optTextActive: { color: Colors.primary },
  startBtn: {
    backgroundColor: Colors.primaryDim, paddingVertical: Spacing.lg,
    borderRadius: 12, alignItems: 'center', marginTop: Spacing.xl,
  },
  startBtnText: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },

  flashContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flashProgress: { color: Colors.textDim, fontSize: FontSize.md, marginBottom: Spacing.lg },
  flashCard: { fontSize: 120, fontWeight: '900' },
  flashHint: { color: Colors.textDim, fontSize: FontSize.md, marginTop: Spacing.xl },

  answerContainer: { flex: 1, justifyContent: 'center', padding: Spacing.xl },
  answerPrompt: {
    color: Colors.text, fontSize: FontSize.xl, fontWeight: '700',
    textAlign: 'center', marginBottom: Spacing.lg,
  },
  answerInput: {
    backgroundColor: Colors.surface, color: Colors.text, fontSize: FontSize.xxl,
    fontWeight: '700', textAlign: 'center', padding: Spacing.lg, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, fontVariant: ['tabular-nums'],
  },

  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  resultEmoji: { fontSize: 64, marginBottom: Spacing.md },
  resultTitle: { fontSize: FontSize.xxl, fontWeight: '800', marginBottom: Spacing.md },
  resultDetail: { color: Colors.textSecondary, fontSize: FontSize.md, marginBottom: Spacing.xs },
  resultActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },

  quizContainer: { flex: 1, padding: Spacing.lg, justifyContent: 'center' },
  handDisplay: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  handCard: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.lg,
    alignItems: 'center', minWidth: 100, borderWidth: 1, borderColor: Colors.border,
  },
  handCardLabel: { color: Colors.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  handCardValue: { color: Colors.text, fontSize: 36, fontWeight: '900', marginVertical: Spacing.xs },
  handCardType: { color: Colors.textSecondary, fontSize: FontSize.sm },
  vsText: { color: Colors.textDim, fontSize: FontSize.xl, fontWeight: '700', marginHorizontal: Spacing.lg },

  feedbackBanner: {
    padding: Spacing.md, borderRadius: 8, marginBottom: Spacing.lg, alignItems: 'center',
  },
  feedbackText: { fontSize: FontSize.md, fontWeight: '700' },

  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center' },
  actionBtn: {
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg,
    borderRadius: 10, borderWidth: 1, alignItems: 'center', minWidth: 80,
  },
  actionBtnText: { fontSize: FontSize.md, fontWeight: '700' },

  tcBadge: {
    alignSelf: 'center', backgroundColor: Colors.surface, borderRadius: 12,
    padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, minWidth: 120,
  },
  tcBadgeLabel: { color: Colors.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  tcBadgeValue: { fontSize: 36, fontWeight: '900' },

  deviationHint: {
    color: Colors.textSecondary, fontSize: FontSize.md, textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  tcQuestionBox: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.xl,
    marginBottom: Spacing.xl, borderWidth: 1, borderColor: Colors.border,
  },
  tcQRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  tcQLabel: { color: Colors.textSecondary, fontSize: FontSize.lg },
  tcQValue: { color: Colors.text, fontSize: FontSize.xl, fontWeight: '800', fontVariant: ['tabular-nums'] },
});
