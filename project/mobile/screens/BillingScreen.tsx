import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../constants/theme';
import { searchMedicines, Medicine } from '../services/medicines';
import { getBatches, Batch } from '../services/batches';
import { createBill } from '../services/bills';
import CartItem, { CartItemData } from '../components/CartItem';

export default function BillingScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Medicine[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Card' | 'UPI'>('Cash');
  const [submitting, setSubmitting] = useState(false);
  const [batchModal, setBatchModal] = useState<{ visible: boolean; batches: Batch[]; medicineName: string }>({
    visible: false, batches: [], medicineName: '',
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset when screen comes back into focus
  useFocusEffect(useCallback(() => {}, []));

  const handleSearch = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchMedicines(text.trim());
        setSuggestions(results.slice(0, 8));
      } catch { setSuggestions([]); }
      finally { setSearchLoading(false); }
    }, 300);
  };

  const selectMedicine = async (med: Medicine) => {
    setQuery('');
    setSuggestions([]);
    try {
      const batches = await getBatches(med.id);
      const validBatches = batches.filter(b => {
        const exp = new Date(b.expiry_date);
        return exp > new Date() && b.stock_quantity > 0;
      });
      if (validBatches.length === 0) {
        Toast.show({ type: 'error', text1: 'No Stock', text2: `${med.name} has no valid batches.` });
        return;
      }
      if (validBatches.length === 1) {
        addToCart(validBatches[0], med);
      } else {
        setBatchModal({ visible: true, batches: validBatches, medicineName: med.name });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not load batches.' });
    }
  };

  const addToCart = (batch: Batch, med?: Medicine) => {
    setBatchModal(prev => ({ ...prev, visible: false }));
    const exists = cartItems.find(c => c.batchId === batch.id);
    if (exists) {
      setCartItems(prev => prev.map(c => c.batchId === batch.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      const newItem: CartItemData = {
        batchId: batch.id,
        medicineName: batch.medicine?.name ?? med?.name ?? 'Unknown',
        manufacturer: batch.medicine?.manufacturer ?? '',
        batchNo: batch.batch_no,
        expiryDate: batch.expiry_date,
        mrp: batch.mrp,
        quantity: 1,
        gstPct: batch.medicine?.gst_percentage ?? 0,
      };
      setCartItems(prev => [...prev, newItem]);
    }
  };

  const updateQty = (batchId: number, qty: number) => {
    setCartItems(prev => prev.map(c => c.batchId === batchId ? { ...c, quantity: qty } : c));
  };

  const removeItem = (batchId: number) => {
    setCartItems(prev => prev.filter(c => c.batchId !== batchId));
  };

  const total = cartItems.reduce((sum, c) => sum + c.mrp * c.quantity, 0);
  const gstTotal = cartItems.reduce((sum, c) => {
    const base = c.mrp / (1 + c.gstPct / 100);
    return sum + (c.mrp - base) * c.quantity;
  }, 0);
  const subtotal = total - gstTotal;

  const generateBill = async () => {
    if (cartItems.length === 0) {
      Toast.show({ type: 'error', text1: 'Empty Cart', text2: 'Add at least one medicine.' });
      return;
    }
    setSubmitting(true);
    try {
      const bill = await createBill({
        customer_name: customerName || 'Walk-in',
        payment_mode: paymentMode,
        items: cartItems.map(c => ({ batch_id: c.batchId, quantity: c.quantity })),
      });
      Toast.show({ type: 'success', text1: '✅ Bill Created!', text2: `${bill.serial_no} — ₹${bill.total_amount.toFixed(2)}` });
      setCartItems([]);
      setCustomerName('');
      navigation.navigate('Invoice', { billId: bill.id, bill });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>New Bill</Text>
        {cartItems.length > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
          </View>
        )}
      </View>

      {/* Customer + Payment */}
      <View style={styles.metaRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Customer name (optional)"
          placeholderTextColor={Colors.textMuted}
          value={customerName}
          onChangeText={setCustomerName}
        />
        <View style={styles.paymentToggle}>
          {(['Cash', 'UPI', 'Card'] as const).map(mode => (
            <TouchableOpacity
              key={mode}
              style={[styles.payBtn, paymentMode === mode && styles.payBtnActive]}
              onPress={() => setPaymentMode(mode)}
            >
              <Text style={[styles.payBtnText, paymentMode === mode && styles.payBtnTextActive]}>{mode}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchBox, Shadow.sm]}>
        <Ionicons name="search" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search medicine…"
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={handleSearch}
          autoCorrect={false}
        />
        {searchLoading && <ActivityIndicator size="small" color={Colors.primary} />}
        {query.length > 0 && !searchLoading && (
          <TouchableOpacity onPress={() => { setQuery(''); setSuggestions([]); }}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <View style={[styles.dropdown, Shadow.md]}>
          {suggestions.map(med => (
            <TouchableOpacity key={med.id} style={styles.suggestionItem} onPress={() => selectMedicine(med)}>
              <Ionicons name="medkit-outline" size={16} color={Colors.primary} />
              <View>
                <Text style={styles.suggestionName}>{med.name}</Text>
                <Text style={styles.suggestionMeta}>{med.manufacturer}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Cart */}
      <FlatList
        data={cartItems}
        keyExtractor={item => item.batchId.toString()}
        renderItem={({ item }) => (
          <CartItem item={item} onQuantityChange={updateQty} onRemove={removeItem} />
        )}
        style={styles.cartList}
        ListEmptyComponent={
          <View style={styles.emptyCart}>
            <Ionicons name="cart-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Search and add medicines above</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 8 }}
      />

      {/* Summary + Generate */}
      {cartItems.length > 0 && (
        <View style={[styles.summaryBox, Shadow.lg]}>
          <View style={styles.summaryRows}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST</Text>
              <Text style={styles.summaryValue}>₹{gstTotal.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.generateBtn, submitting && styles.generateBtnDisabled]}
            onPress={generateBill}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <><Ionicons name="receipt-outline" size={20} color="#fff" /><Text style={styles.generateBtnText}>Generate Bill</Text></>
            }
          </TouchableOpacity>
        </View>
      )}

      {/* Batch Picker Modal */}
      <Modal visible={batchModal.visible} transparent animationType="slide" onRequestClose={() => setBatchModal(p => ({ ...p, visible: false }))}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Batch — {batchModal.medicineName}</Text>
              <TouchableOpacity onPress={() => setBatchModal(p => ({ ...p, visible: false }))}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            {batchModal.batches.map(b => (
              <TouchableOpacity key={b.id} style={styles.batchOption} onPress={() => addToCart(b)}>
                <View>
                  <Text style={styles.batchOptionBatchNo}>Batch: {b.batch_no}</Text>
                  <Text style={styles.batchOptionMeta}>Stock: {b.stock_quantity} · Exp: {new Date(b.expiry_date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}</Text>
                </View>
                <Text style={styles.batchOptionMrp}>₹{b.mrp.toFixed(2)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.sm },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, flex: 1 },
  cartBadge: { backgroundColor: Colors.primary, borderRadius: Radius.full, width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  metaRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.sm, alignItems: 'center' },
  input: { backgroundColor: Colors.card, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: FontSize.body, color: Colors.text },
  paymentToggle: { flexDirection: 'row', backgroundColor: Colors.background, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  payBtn: { paddingHorizontal: 10, paddingVertical: 10 },
  payBtnActive: { backgroundColor: Colors.primary },
  payBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  payBtnTextActive: { color: '#fff' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.md, marginHorizontal: Spacing.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: Spacing.sm, marginBottom: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSize.body, color: Colors.text, paddingVertical: 6 },
  dropdown: { backgroundColor: Colors.card, marginHorizontal: Spacing.lg, borderRadius: Radius.md, overflow: 'hidden', zIndex: 100, position: 'absolute', top: 188, left: 0, right: 0, marginLeft: Spacing.lg, marginRight: Spacing.lg },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  suggestionName: { fontSize: FontSize.body, fontWeight: FontWeight.medium, color: Colors.text },
  suggestionMeta: { fontSize: FontSize.sm, color: Colors.textMuted },
  cartList: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, zIndex: 0 },
  emptyCart: { alignItems: 'center', paddingTop: 60, gap: Spacing.sm },
  emptyText: { fontSize: FontSize.body, color: Colors.textMuted },
  summaryBox: { backgroundColor: Colors.card, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md },
  summaryRows: { gap: Spacing.xs },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: FontSize.body, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.body, color: Colors.text },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm, marginTop: Spacing.xs },
  totalLabel: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  totalValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  generateBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  generateBtnDisabled: { opacity: 0.6 },
  generateBtnText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.card, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text },
  batchOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, backgroundColor: Colors.background, borderRadius: Radius.sm },
  batchOptionBatchNo: { fontSize: FontSize.body, fontWeight: FontWeight.semibold, color: Colors.text },
  batchOptionMeta: { fontSize: FontSize.sm, color: Colors.textMuted },
  batchOptionMrp: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
});
