import React from 'react';
import { View, StyleSheet, Platform, DimensionValue } from 'react-native';

/**
 * Subtle felt-like texture overlay for large background areas.
 * Uses a CSS radial-gradient noise pattern on web, and a
 * semi-transparent dot grid on native.
 *
 * Place as first child inside a container with position: 'relative'.
 */
export function FeltTexture({ opacity = 0.035 }: { opacity?: number }) {
  if (Platform.OS === 'web') {
    return (
      <View
        style={[styles.overlay, { opacity }]}
        // @ts-ignore — web-only style
        dataSet={{ felt: true }}
      >
        <View
          style={StyleSheet.absoluteFill}
          // @ts-ignore — web-only CSS
          nativeID="felt-noise"
        />
        <style
          // @ts-ignore
          dangerouslySetInnerHTML={{
            __html: `
              [data-felt] > #felt-noise {
                background-image:
                  radial-gradient(circle at 20% 30%, rgba(201, 168, 76, 0.08) 0.5px, transparent 0.5px),
                  radial-gradient(circle at 60% 70%, rgba(160, 152, 130, 0.06) 0.5px, transparent 0.5px),
                  radial-gradient(circle at 80% 20%, rgba(232, 213, 163, 0.05) 0.5px, transparent 0.5px),
                  radial-gradient(circle at 40% 80%, rgba(155, 77, 90, 0.04) 0.5px, transparent 0.5px);
                background-size: 7px 7px, 11px 11px, 13px 13px, 9px 9px;
              }
            `,
          }}
        />
      </View>
    );
  }

  // Native: render a sparse grid of tiny dots for texture
  return (
    <View style={[styles.overlay, { opacity }]} pointerEvents="none">
      {DOTS.map((dot, i) => (
        <View
          key={i}
          style={[styles.dot, {
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
            borderRadius: dot.size / 2,
            backgroundColor: dot.color,
          }]}
        />
      ))}
    </View>
  );
}

// Pre-computed pseudo-random dot positions for native
const DOTS = (() => {
  const dots: { x: DimensionValue; y: DimensionValue; size: number; color: string }[] = [];
  const colors = [
    'rgba(201, 168, 76, 0.3)',
    'rgba(160, 152, 130, 0.25)',
    'rgba(232, 213, 163, 0.2)',
    'rgba(107, 99, 85, 0.2)',
  ];
  let seed = 42;
  const rand = () => { seed = (seed * 16807 + 0) % 2147483647; return seed / 2147483647; };

  for (let i = 0; i < 80; i++) {
    dots.push({
      x: `${(rand() * 100).toFixed(1)}%` as DimensionValue,
      y: `${(rand() * 100).toFixed(1)}%` as DimensionValue,
      size: 1 + rand() * 1.5,
      color: colors[Math.floor(rand() * colors.length)],
    });
  }
  return dots;
})();

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  dot: {
    position: 'absolute',
  },
});
