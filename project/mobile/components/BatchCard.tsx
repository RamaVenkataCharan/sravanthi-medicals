import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../constants/theme';
import { Batch } from '../services/batches';

interface BatchCardProps {
  batch: Batch;
}

const getBatchStatus = (batch: Batch) => {
  const expiryDate = new Date(batch.expiry_date);
  const today = new Date();
  const daysUntilExpiry = Math.floor(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) {
    return { label: 'Expired', color: Colors.danger, bg: Colors.dangerLight, icon: 'alert-circle' as const };
  }
  if (daysUntilExpiry <= 30) {
    return { label: 'Expiring Soon', color: Colors.warning, bg: Colors.warningLight, icon: 'time' as const };
  }
  if (batch.stock_quantity < 10) {
    return { label: 'Low Stock', color: Colors.warning, bg: Colors.warningLight, icon: 'warning' as const };
  }
  return { label: 'In Stock', color: Colors.success, bg: Colors.successLight, icon: 'checkmark-circle' as const };
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const BatchCard: React.FC<BatchCardProps> = ({ batch }) => {
  const status = getBatchStatus(batch);

  return (
    <View style={[styles.card, Shadow.sm]}>
      <View style={styles.header}>
        <View style={styles.nameSection}>
          <Text style={styles.medicineName}>{batch.medicine?.name ?? 'Unknown'}</Text>
          <Text style={styles.manufacturer}>{batch.medicine?.manufacturer ?? ''}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: status.bg }]}>
          <Ionicons name={status.icon} size={12} color={status.color} />
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Batch No</Text>
          <Text style={styles.metaValue}>{batch.batch_no}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Expiry</Text>
          <Text style={[styles.metaValue, status.label === 'Expired' && { color: Colors.danger }]}>
            {formatDate(batch.expiry_date)}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Stock</Text>
          <Text style={[styles.metaValue, batch.stock_quantity < 10 && { color: Colors.warning }]}>
            {batch.stock_quantity} units
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>MRP</Text>
          <Text style={[styles.metaValue, { color: Colors.primary }]}>₹{batch.mrp.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameSection: { flex: 1, marginRight: Spacing.sm },
  medicineName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  manufacturer: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  metaItem: { alignItems: 'center', flex: 1 },
  metaLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  metaValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
});

export default BatchCard;
