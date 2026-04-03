import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Pressable,
} from 'react-native';
import { Colors, Spacing, FontSize } from '../constants/theme';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                destructive ? styles.destructiveButton : styles.confirmButton,
              ]}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.confirmText,
                destructive && styles.destructiveText,
              ]}>
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    maxWidth: 320,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  message: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.surfaceLight,
  },
  confirmButton: {
    backgroundColor: Colors.primaryDim,
  },
  destructiveButton: {
    backgroundColor: Colors.danger + '20',
    borderWidth: 1,
    borderColor: Colors.danger + '60',
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  confirmText: {
    color: Colors.primary,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  destructiveText: {
    color: Colors.danger,
  },
});
