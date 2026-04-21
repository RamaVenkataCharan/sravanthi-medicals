import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Share, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../constants/theme';
import { getSettings } from '../services/settings';
import { Bill } from '../services/bills';

export default function InvoiceScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { bill }: { bill: Bill } = route.params;
  const [storeName, setStoreName] = useState('Sravanthi Medicals');
  const [storeAddress, setStoreAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    getSettings()
      .then(s => {
        if (s.store_name) setStoreName(s.store_name);
        if (s.address) setStoreAddress(s.address);
        if (s.gst_number) setGstNumber(s.gst_number);
      })
      .catch(() => {});
  }, []);

  const formatDate = (str: string) =>
    new Date(str).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const generateHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; color: #0F172A; }
        .header { text-align: center; border-bottom: 2px solid #2563EB; padding-bottom: 16px; margin-bottom: 16px; }
        .store-name { font-size: 22px; font-weight: bold; color: #2563EB; }
        .meta { font-size: 13px; color: #64748B; margin: 2px 0; }
        .inv-row { display: flex; justify-content: space-between; margin: 4px 0; }
        .inv-label { font-size: 13px; color: #64748B; }
        .inv-value { font-size: 13px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { text-align: left; font-size: 12px; color: #64748B; padding: 6px 4px; border-bottom: 1px solid #E2E8F0; }
        td { font-size: 13px; padding: 8px 4px; border-bottom: 1px solid #F1F5F9; }
        .totals { border-top: 2px solid #E2E8F0; padding-top: 12px; margin-top: 4px; }
        .total-row { display: flex; justify-content: space-between; margin: 6px 0; }
        .total-final .total-row { font-size: 16px; font-weight: bold; color: #2563EB; }
        .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #94A3B8; border-top: 1px dashed #CBD5E1; padding-top: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="store-name">${storeName}</div>
        ${storeAddress ? `<div class="meta">${storeAddress}</div>` : ''}
        ${gstNumber ? `<div class="meta">GSTIN: ${gstNumber}</div>` : ''}
      </div>

      <div class="inv-row"><span class="inv-label">Bill No</span><span class="inv-value">${bill.serial_no}</span></div>
      <div class="inv-row"><span class="inv-label">Date</span><span class="inv-value">${formatDate(bill.created_at)}</span></div>
      <div class="inv-row"><span class="inv-label">Customer</span><span class="inv-value">${bill.customer_name || 'Walk-in'}</span></div>
      ${bill.doctor_name ? `<div class="inv-row"><span class="inv-label">Doctor</span><span class="inv-value">${bill.doctor_name}</span></div>` : ''}
      <div class="inv-row"><span class="inv-label">Payment</span><span class="inv-value">${bill.payment_mode}</span></div>

      <table>
        <thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>GST%</th><th>Total</th></tr></thead>
        <tbody>
          ${(bill.items || []).map(item => `
            <tr>
              <td>${item.batch?.medicine?.name ?? 'Medicine'}<br/><small style="color:#94A3B8">${item.batch?.batch_no ?? ''}</small></td>
              <td>${item.quantity}</td>
              <td>₹${item.price?.toFixed(2)}</td>
              <td>${item.gst_percentage}%</td>
              <td>₹${item.total?.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row"><span>Subtotal</span><span>₹${bill.subtotal?.toFixed(2)}</span></div>
        <div class="total-row"><span>GST</span><span>₹${bill.gst_total?.toFixed(2)}</span></div>
        <div class="total-row" style="font-size:17px;font-weight:bold;color:#2563EB;margin-top:8px;">
          <span>TOTAL</span><span>₹${bill.total_amount?.toFixed(2)}</span>
        </div>
      </div>

      <div class="footer">Thank you for your purchase!<br/>Powered by Sravanthi Medicals POS</div>
    </body>
    </html>
  `;

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await Print.printAsync({ html: generateHTML() });
    } catch (e: any) {
      Alert.alert('Print Error', e.message);
    } finally {
      setPrinting(false);
    }
  };

  const handleShare = async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html: generateHTML() });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Invoice ${bill.serial_no}` });
      } else {
        Alert.alert('Share not available', 'Sharing is not supported on this device.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.root}>
      {/* Custom Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{bill.serial_no}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Store Header */}
        <View style={styles.storeHeader}>
          <Text style={styles.storeName}>{storeName}</Text>
          {storeAddress ? <Text style={styles.storeAddress}>{storeAddress}</Text> : null}
          {gstNumber ? <Text style={styles.gstNo}>GSTIN: {gstNumber}</Text> : null}
        </View>

        {/* Bill Meta */}
        <View style={[styles.metaCard, Shadow.sm]}>
          {([
            ['Bill No', bill.serial_no],
            ['Date', formatDate(bill.created_at)],
            ['Customer', bill.customer_name || 'Walk-in'],
            ...(bill.doctor_name ? [['Doctor', bill.doctor_name]] : []),
            ['Payment', bill.payment_mode],
          ] as [string, string][]).map(([label, value]) => (
            <View key={label} style={styles.metaRow}>
              <Text style={styles.metaLabel}>{label}</Text>
              <Text style={styles.metaValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Items Table */}
        <View style={[styles.itemsCard, Shadow.sm]}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col, { flex: 3 }]}>Medicine</Text>
            <Text style={[styles.col, { flex: 1, textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.col, { flex: 2, textAlign: 'right' }]}>Amount</Text>
          </View>
          {(bill.items || []).map((item, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
              <View style={{ flex: 3 }}>
                <Text style={styles.itemName}>{item.batch?.medicine?.name ?? 'Medicine'}</Text>
                <Text style={styles.itemBatch}>
                  Batch {item.batch?.batch_no} · GST {item.gst_percentage}%
                </Text>
              </View>
              <Text style={[styles.itemQty, { flex: 1 }]}>{item.quantity}</Text>
              <Text style={[styles.itemTotal, { flex: 2 }]}>₹{item.total?.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={[styles.totalsCard, Shadow.sm]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₹{bill.subtotal?.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>GST</Text>
            <Text style={styles.totalValue}>₹{bill.gst_total?.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>TOTAL</Text>
            <Text style={styles.grandTotalValue}>₹{bill.total_amount?.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.thankYou}>Thank you for your purchase! 🙏</Text>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, styles.shareBtn]} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color={Colors.primary} />
          <Text style={styles.shareBtnText}>Share / PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.printBtn]}
          onPress={handlePrint}
          disabled={printing}
        >
          {printing
            ? <ActivityIndicator color="#fff" />
            : <><Ionicons name="print-outline" size={20} color="#fff" /><Text style={styles.printBtnText}>Print</Text></>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  navTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 32 },
  storeHeader: { alignItems: 'center', padding: Spacing.lg, backgroundColor: Colors.primary, borderRadius: Radius.lg, gap: 4 },
  storeName: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: '#fff' },
  storeAddress: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  gstNo: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 },
  metaCard: { backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.lg, gap: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metaLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  metaValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  itemsCard: { backgroundColor: Colors.card, borderRadius: Radius.md, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: Colors.primaryLight, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  col: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  tableRowAlt: { backgroundColor: Colors.background },
  itemName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  itemBatch: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  itemQty: { fontSize: FontSize.sm, color: Colors.text, textAlign: 'center' },
  itemTotal: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, textAlign: 'right' },
  totalsCard: { backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.lg, gap: Spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: FontSize.body, color: Colors.textSecondary },
  totalValue: { fontSize: FontSize.body, color: Colors.text },
  grandTotalRow: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm, marginTop: 4 },
  grandTotalLabel: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  grandTotalValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  thankYou: { textAlign: 'center', fontSize: FontSize.sm, color: Colors.textMuted },
  actions: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.lg, backgroundColor: Colors.card, borderTopWidth: 1, borderTopColor: Colors.border },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, borderRadius: Radius.md, paddingVertical: 14 },
  shareBtn: { backgroundColor: Colors.primaryLight, borderWidth: 1, borderColor: Colors.primary },
  shareBtnText: { fontSize: FontSize.body, fontWeight: FontWeight.semibold, color: Colors.primary },
  printBtn: { backgroundColor: Colors.primary },
  printBtnText: { fontSize: FontSize.body, fontWeight: FontWeight.semibold, color: '#fff' },
});
