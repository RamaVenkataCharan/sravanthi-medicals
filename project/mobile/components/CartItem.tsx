import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../constants/theme';

export interface CartItemData {
  batchId: number;
  medicineName: string;
  manufacturer: string;
  batchNo: string;
  expiryDate: string;
  mrp: number;
  quantity: number;
  gstPct: number;
}

interface CartItemProps {
  item: CartItemData;
  onQuantityChange: (batchId: number, newQty: number) => void;
  onRemove: (batchId: number) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onQuantityChange, onRemove }) => {
  const total = item.mrp * item.quantity;
  const expiryFormatted = new Date(item.expiryDate).toLocaleDateString('en-IN', {
    month: 'short',
    year: '2-digit',
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.nameBlock}>
          <Text style={styles.name}>{item.medicineName}</Text>
          <Text style={styles.meta}>
            Batch {item.batchNo} · Exp {expiryFormatted}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onRemove(item.batchId)} style={styles.removeBtn} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        {/* Quantity Stepper */}
        <View style={styles.stepper}>
          <TouchableOpacity
            style={[styles.stepBtn, item.quantity <= 1 && styles.stepBtnDisabled]}
            onPress={() => item.quantity > 1 && onQuantityChange(item.batchId, item.quantity - 1)}
          >
            <Ionicons name="remove" size={18} color={item.quantity <= 1 ? Colors.textMuted : Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.qty}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.stepBtn}
            onPress={() => onQuantityChange(item.batchId, item.quantity + 1)}
          >
            <Ionicons name="add" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.priceBlock}>
          <Text style={styles.unitPrice}>₹{item.mrp.toFixed(2)} × {item.quantity}</Text>
          <Text style={styles.total}>₹{total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  nameBlock: { flex: 1 },
  name: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  meta: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  removeBtn: {
    padding: 4,
    marginLeft: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    padding: 2,
    gap: 2,
  },
  stepBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.sm - 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepBtnDisabled: {
    borderColor: Colors.border,
  },
  qty: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    minWidth: 32,
    textAlign: 'center',
  },
  priceBlock: { alignItems: 'flex-end' },
  unitPrice: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  total: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
});

export default CartItem;
