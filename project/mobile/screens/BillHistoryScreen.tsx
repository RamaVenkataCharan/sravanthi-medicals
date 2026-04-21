import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../constants/theme';
import { getBills, Bill } from '../services/bills';
import BillCard from '../components/BillCard';

export default function BillHistoryScreen() {
  const navigation = useNavigation<any>();
  const [bills, setBills] = useState<Bill[]>([]);
  const [filtered, setFiltered] = useState<Bill[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBills = async () => {
    try {
      const data = await getBills();
      // Show newest first
      const sorted = [...data].reverse();
      setBills(sorted);
      setFiltered(sorted);
    } catch { } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadBills(); }, []));

  const handleSearch = (text: string) => {
    setQuery(text);
    if (!text.trim()) { setFiltered(bills); return; }
    const q = text.toLowerCase();
    setFiltered(bills.filter(b =>
      b.serial_no?.toLowerCase().includes(q) ||
      b.customer_name?.toLowerCase().includes(q) ||
      b.doctor_name?.toLowerCase().includes(q)
    ));
  };

  const todayTotal = bills
    .filter(b => b.created_at?.slice(0, 10) === new Date().toISOString().slice(0, 10))
    .reduce((s, b) => s + b.total_amount, 0);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={styles.root}>
      {/* Stats Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerStat}>
          <Text style={styles.bannerValue}>{bills.length}</Text>
          <Text style={styles.bannerLabel}>Total Bills</Text>
        </View>
        <View style={styles.bannerDivider} />
        <View style={styles.bannerStat}>
          <Text style={styles.bannerValue}>₹{todayTotal.toFixed(0)}</Text>
          <Text style={styles.bannerLabel}>Today's Revenue</Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchBox, Shadow.sm]}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by invoice no or customer..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <BillCard bill={item} onPress={() => navigation.navigate('Invoice', { bill: item })} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBills(); }} colors={[Colors.primary]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>{query ? 'No matching bills' : 'No bills yet'}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  banner: { flexDirection: 'row', backgroundColor: Colors.card, padding: Spacing.lg, marginBottom: Spacing.md, justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: Colors.border },
  bannerStat: { alignItems: 'center' },
  bannerValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.primary },
  bannerLabel: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  bannerDivider: { width: 1, backgroundColor: Colors.border },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.md, marginHorizontal: Spacing.lg, marginBottom: Spacing.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSize.body, color: Colors.text, paddingVertical: 6 },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingTop: 60, gap: Spacing.sm },
  emptyText: { fontSize: FontSize.body, color: Colors.textMuted },
});
