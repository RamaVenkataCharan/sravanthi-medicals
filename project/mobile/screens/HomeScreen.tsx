import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, FontSize, FontWeight, Radius, Spacing, Shadow } from '../constants/theme';
import { getBills, Bill } from '../services/bills';
import { getSettings } from '../services/settings';
import StatCard from '../components/StatCard';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [bills, setBills] = useState<Bill[]>([]);
  const [storeName, setStoreName] = useState('Sravanthi Medicals');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [billsData, settings] = await Promise.all([getBills(), getSettings()]);
      setBills(billsData);
      if (settings.store_name) setStoreName(settings.store_name);
    } catch { }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadData(); }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayBills = bills.filter(b => b.created_at?.slice(0, 10) === todayStr);
  const todaySales = todayBills.reduce((s, b) => s + b.total_amount, 0);
  const totalRevenue = bills.reduce((s, b) => s + b.total_amount, 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[Colors.primary]} />}
    >
      {/* Greeting Header */}
      <View style={styles.greetingBox}>
        <Text style={styles.storeLabel}>{storeName}</Text>
        <Text style={styles.greeting}>{greeting} 👋</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Stat Cards */}
      <Text style={styles.sectionTitle}>Today's Overview</Text>
      <View style={styles.statsRow}>
        <StatCard
          label="Today's Sales"
          value={`₹${todaySales.toFixed(0)}`}
          color={Colors.success}
          bgColor={Colors.successLight}
          icon={<Ionicons name="trending-up" size={22} color={Colors.success} />}
        />
        <StatCard
          label="Bills Today"
          value={todayBills.length.toString()}
          color={Colors.primary}
          bgColor={Colors.primaryLight}
          icon={<Ionicons name="receipt-outline" size={22} color={Colors.primary} />}
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          label="Total Revenue"
          value={`₹${(totalRevenue / 1000).toFixed(1)}k`}
          color={Colors.warning}
          bgColor={Colors.warningLight}
          icon={<Ionicons name="wallet-outline" size={22} color={Colors.warning} />}
        />
        <StatCard
          label="All Bills"
          value={bills.length.toString()}
          color={Colors.textSecondary}
          bgColor={Colors.background}
          icon={<Ionicons name="documents-outline" size={22} color={Colors.textSecondary} />}
        />
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <TouchableOpacity
        style={[styles.actionBtn, styles.actionBtnPrimary, Shadow.md]}
        onPress={() => navigation.navigate('Billing')}
      >
        <View style={styles.actionBtnIcon}>
          <Ionicons name="add-circle" size={28} color="#fff" />
        </View>
        <View style={styles.actionBtnText}>
          <Text style={styles.actionBtnTitle}>New Bill</Text>
          <Text style={styles.actionBtnSub}>Create a new billing entry</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtn, styles.actionBtnSecondary, Shadow.sm]}
        onPress={() => navigation.navigate('Inventory')}
      >
        <View style={[styles.actionBtnIcon, { backgroundColor: Colors.primaryLight }]}>
          <Ionicons name="cube-outline" size={26} color={Colors.primary} />
        </View>
        <View style={styles.actionBtnText}>
          <Text style={[styles.actionBtnTitle, { color: Colors.text }]}>View Inventory</Text>
          <Text style={[styles.actionBtnSub, { color: Colors.textSecondary }]}>Check batches and stock</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtn, styles.actionBtnSecondary, Shadow.sm]}
        onPress={() => navigation.navigate('History')}
      >
        <View style={[styles.actionBtnIcon, { backgroundColor: Colors.successLight }]}>
          <Ionicons name="time-outline" size={26} color={Colors.success} />
        </View>
        <View style={styles.actionBtnText}>
          <Text style={[styles.actionBtnTitle, { color: Colors.text }]}>Bill History</Text>
          <Text style={[styles.actionBtnSub, { color: Colors.textSecondary }]}>View past bills & invoices</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
      </TouchableOpacity>

      {/* Recent Bills */}
      {bills.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Bills</Text>
          {bills.slice(-3).reverse().map(bill => (
            <TouchableOpacity
              key={bill.id}
              style={[styles.recentBill, Shadow.sm]}
              onPress={() => navigation.navigate('Invoice', { bill })}
            >
              <View>
                <Text style={styles.recentBillNo}>{bill.serial_no}</Text>
                <Text style={styles.recentBillCustomer}>{bill.customer_name || 'Walk-in'}</Text>
              </View>
              <Text style={styles.recentBillAmt}>₹{bill.total_amount.toFixed(2)}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  greetingBox: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: 4,
  },
  storeLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', fontWeight: FontWeight.semibold, letterSpacing: 1, textTransform: 'uppercase' },
  greeting: { fontSize: FontSize.title, fontWeight: FontWeight.extrabold, color: '#fff' },
  dateText: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md, letterSpacing: 0.5, textTransform: 'uppercase' },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  actionBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.md, padding: Spacing.lg, gap: Spacing.md, marginBottom: Spacing.sm },
  actionBtnPrimary: { backgroundColor: Colors.primary },
  actionBtnSecondary: { backgroundColor: Colors.card },
  actionBtnIcon: { width: 48, height: 48, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },
  actionBtnText: { flex: 1 },
  actionBtnTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: '#fff' },
  actionBtnSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  recentBill: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, marginBottom: Spacing.sm },
  recentBillNo: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  recentBillCustomer: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  recentBillAmt: { fontSize: FontSize.body, fontWeight: FontWeight.bold, color: Colors.success },
});
