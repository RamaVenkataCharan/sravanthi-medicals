import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../constants/theme';
import { Bill } from '../services/bills';

interface BillCardProps {
  bill: Bill;
  onPress: () => void;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const BillCard: React.FC<BillCardProps> = ({ bill, onPress }) => {
  return (
    <TouchableOpacity style={[styles.card, Shadow.sm]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <View style={styles.invoiceTag}>
          <Text style={styles.invoiceTagText}>{bill.serial_no}</Text>
        </View>
        <Text style={styles.customer}>{bill.customer_name || 'Walk-in Customer'}</Text>
        <Text style={styles.date}>{formatDate(bill.created_at)}</Text>
        <Text style={styles.itemCount}>
          {bill.items?.length ?? 0} item{(bill.items?.length ?? 0) !== 1 ? 's' : ''} · {bill.payment_mode}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>₹{bill.total_amount.toFixed(2)}</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} style={{ marginTop: 4 }} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: { flex: 1, gap: 3 },
  invoiceTag: {
    backgroundColor: Colors.primaryLight,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    marginBottom: 4,
  },
  invoiceTagText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  customer: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  date: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  itemCount: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },
});

export default BillCard;
