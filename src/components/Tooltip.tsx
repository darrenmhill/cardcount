import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Pressable,
  LayoutRectangle, StyleProp, ViewStyle,
} from 'react-native';
import { Colors, Spacing, FontSize } from '../constants/theme';

interface TooltipProps {
  title: string;
  body: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  hideInfoBadge?: boolean;
}

export function Tooltip({ title, body, children, style, hideInfoBadge }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setVisible(true)}
        style={[styles.trigger, style]}
      >
        {children}
        {!hideInfoBadge && (
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>i</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.tooltipCard}>
            <Text style={styles.tooltipTitle}>{title}</Text>
            <Text style={styles.tooltipBody}>{body}</Text>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.dismissText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    position: 'relative',
  },
  infoBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBadgeText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  tooltipCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    maxWidth: 340,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tooltipTitle: {
    color: Colors.primary,
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  tooltipBody: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  dismissButton: {
    marginTop: Spacing.lg,
    alignSelf: 'flex-end',
    backgroundColor: Colors.primaryDim + '40',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  dismissText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
});
