import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../constants/theme';
import { getBatches, Batch } from '../services/batches';
import BatchCard from '../components/BatchCard';

export default function InventoryScreen() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filtered, setFiltered] = useState<Batch[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBatches = async () => {
    try {
      const data = await getBatches();
      setBatches(data);
      setFiltered(data);
    } catch { } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadBatches(); }, []));

  const handleSearch = (text: string) => {
    setQuery(text);
    if (!text.trim()) { setFiltered(batches); return; }
    const q = text.toLowerCase();
    setFiltered(batches.filter(b =>
      b.medicine?.name?.toLowerCase().includes(q) ||
      b.batch_no?.toLowerCase().includes(q) ||
      b.medicine?.manufacturer?.toLowerCase().includes(q)
    ));
  };

  const expired = batches.filter(b => new Date(b.expiry_date) < new Date()).length;
  const lowStock = batches.filter(b => b.stock_quantity < 10 && new Date(b.expiry_date) >= new Date()).length;
  const healthy = batches.length - expired - lowStock;

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={styles.root}>
      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryChip, { backgroundColor: Colors.successLight }]}>
          <Text style={[styles.summaryCount, { color: Colors.success }]}>{healthy}</Text>
          <Text style={[styles.summaryLabel, { color: Colors.success }]}>Healthy</Text>
        </View>
        <View style={[styles.summaryChip, { backgroundColor: Colors.warningLight }]}>
          <Text style={[styles.summaryCount, { color: Colors.warning }]}>{lowStock}</Text>
          <Text style={[styles.summaryLabel, { color: Colors.warning }]}>Low Stock</Text>
        </View>
        <View style={[styles.summaryChip, { backgroundColor: Colors.dangerLight }]}>
          <Text style={[styles.summaryCount, { color: Colors.danger }]}>{expired}</Text>
          <Text style={[styles.summaryLabel, { color: Colors.danger }]}>Expired</Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchBox, Shadow.sm]}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search medicine or batch..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <BatchCard batch={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBatches(); }} colors={[Colors.primary]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>{query ? 'No matches found' : 'No batches in inventory'}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summaryRow: { flexDirection: 'row', padding: Spacing.lg, gap: Spacing.sm },
  summaryChip: { flex: 1, borderRadius: Radius.sm, paddingVertical: Spacing.sm, alignItems: 'center', gap: 2 },
  summaryCount: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  summaryLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.md, marginHorizontal: Spacing.lg, marginBottom: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSize.body, color: Colors.text, paddingVertical: 6 },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.sm },
  emptyText: { fontSize: FontSize.body, color: Colors.textMuted },
});
