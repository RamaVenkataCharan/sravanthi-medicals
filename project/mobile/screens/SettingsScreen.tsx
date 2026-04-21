import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Colors, FontSize, FontWeight, Radius, Shadow, Spacing } from '../constants/theme';
import { getSettings, updateSettings, StoreSettings } from '../services/settings';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: '',
    address: '',
    gst_number: '',
    printer_config: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      Toast.show({ type: 'success', text1: '✅ Settings Saved', text2: 'Store information updated.' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* Store Info Section */}
      <Text style={styles.sectionTitle}>Store Information</Text>
      <View style={[styles.card, Shadow.sm]}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Store Name</Text>
          <TextInput
            style={styles.input}
            value={settings.store_name}
            onChangeText={v => setSettings(p => ({ ...p, store_name: v }))}
            placeholder="Sravanthi Medicals"
            placeholderTextColor={Colors.textMuted}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={settings.address}
            onChangeText={v => setSettings(p => ({ ...p, address: v }))}
            placeholder="Full shop address"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* GST Section */}
      <Text style={styles.sectionTitle}>Tax Settings</Text>
      <View style={[styles.card, Shadow.sm]}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>GST Number</Text>
          <TextInput
            style={styles.input}
            value={settings.gst_number}
            onChangeText={v => setSettings(p => ({ ...p, gst_number: v }))}
            placeholder="27XXXXX0000X1ZX"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="characters"
          />
        </View>
      </View>

      {/* App Info */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={[styles.card, Shadow.sm]}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
          <View>
            <Text style={styles.infoTitle}>Sravanthi Medicals POS</Text>
            <Text style={styles.infoSub}>Version 1.0.0 · Production</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Ionicons name="server-outline" size={20} color={Colors.success} />
          <View>
            <Text style={styles.infoTitle}>Backend Connection</Text>
            <Text style={styles.infoSub}>FastAPI · SQLite · Local</Text>
          </View>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving
          ? <ActivityIndicator color="#fff" />
          : <><Ionicons name="checkmark-circle-outline" size={22} color="#fff" /><Text style={styles.saveBtnText}>Save Settings</Text></>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: 48, gap: Spacing.sm },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: Spacing.md, marginBottom: Spacing.xs },
  card: { backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.lg, gap: Spacing.sm },
  fieldGroup: { gap: Spacing.xs },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  input: { backgroundColor: Colors.background, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.body, color: Colors.text },
  multiline: { textAlignVertical: 'top', minHeight: 80 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.xs },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  infoTitle: { fontSize: FontSize.body, fontWeight: FontWeight.semibold, color: Colors.text },
  infoSub: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 2 },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginTop: Spacing.md },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
});
