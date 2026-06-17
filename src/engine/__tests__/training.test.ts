import { generateDrillCards, correctDrillCount, SpeedCard } from '../training';

describe('speed-drill counting', () => {
  const make = (card: SpeedCard['card'], isRed: boolean): SpeedCard => ({
    card,
    suit: isRed ? '♥' : '♠',
    isRed,
  });

  it('counts red 7s as +1 and black 7s as 0 for the Red 7 system', () => {
    const cards: SpeedCard[] = [make('7', true), make('7', false), make('7', true)];
    // two red 7s (+1 each) + one black 7 (0) = +2
    expect(correctDrillCount(cards, 'red-7')).toBe(2);
  });

  it('does not let 7 colour affect a balanced system like Hi-Lo (7 = 0)', () => {
    const cards: SpeedCard[] = [make('7', true), make('7', false)];
    expect(correctDrillCount(cards, 'hi-lo')).toBe(0);
  });

  it('produces an integer count for Red 7 regardless of 7 colours', () => {
    const cards: SpeedCard[] = [make('5', false), make('7', true), make('K', true)];
    // 5(+1) + red7(+1) + K(-1) = +1, never a fractional 0.5
    const result = correctDrillCount(cards, 'red-7');
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBe(1);
  });

  it('generates the requested number of cards with consistent colour flags', () => {
    const cards = generateDrillCards(30);
    expect(cards).toHaveLength(30);
    for (const c of cards) {
      expect(c.isRed).toBe(c.suit === '♥' || c.suit === '♦');
    }
  });
});
