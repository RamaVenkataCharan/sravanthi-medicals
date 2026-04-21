import { useState, useEffect } from 'react';
import { Plus, Search, Users, Phone, MapPin, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { Customer, Bill } from '../lib/database.types';
import { formatCurrency, formatDateDisplay } from '../utils/utils';
import Modal from '../components/ui/Modal';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';

const EMPTY_FORM = { name: '', address: '', phone: '' };

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerBills, setCustomerBills] = useState<Bill[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);

  useEffect(() => { loadCustomers(); }, []);

  async function loadCustomers() {
    setLoading(true);
    const { data } = await supabase.from('customers').select('*').order('name');
    if (data) setCustomers(data);
    setLoading(false);
  }

  async function viewHistory(c: Customer) {
    setSelectedCustomer(c);
    setShowHistory(true);
    setLoadingBills(true);
    const { data } = await supabase
      .from('bills')
      .select('*')
      .eq('customer_phone', c.phone)
      .order('created_at', { ascending: false });
    if (data) setCustomerBills(data);
    setLoadingBills(false);
  }

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search)) ||
    (c.address && c.address.toLowerCase().includes(search.toLowerCase()))
  );

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(c: Customer) {
    setEditing(c);
    setForm({ name: c.name, address: c.address || '', phone: c.phone || '' });
    setShowModal(true);
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Customer name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase.from('customers').update({ name: form.name, address: form.address, phone: form.phone }).eq('id', editing.id);
        if (error) throw error;
        toast.success('Customer updated!');
      } else {
        const { error } = await supabase.from('customers').insert({ name: form.name, address: form.address, phone: form.phone });
        if (error) throw error;
        toast.success('Customer added!');
      }
      setShowModal(false);
      loadCustomers();
    } catch { toast.error('Failed to save. Please try again.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-subtitle">{customers.length} registered customers</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or address…" className="input-field pl-9"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="th">Customer Name</th>
                <th className="th">Phone</th>
                <th className="th">Address</th>
                <th className="th text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4}><TableSkeleton rows={5} cols={4} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No customers found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="td font-semibold text-slate-900">{c.name}</td>
                    <td className="td">
                      {c.phone ? (
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Phone className="h-3.5 w-3.5 text-slate-400" /> {c.phone}
                        </div>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="td">
                      {c.address ? (
                        <div className="flex items-start gap-1.5 text-slate-600 max-w-xs">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                          <span className="truncate">{c.address}</span>
                        </div>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="td">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => viewHistory(c)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-green-700 hover:bg-green-50 border border-green-200 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" /> History
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editing ? 'Edit Customer' : 'Add Customer'}
          onClose={() => setShowModal(false)}
          size="sm"
          footer={
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : editing ? 'Update' : 'Add Customer'}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="label">Customer Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Full name" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="Mobile number" />
            </div>
            <div>
              <label className="label">Address</label>
              <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field resize-none" placeholder="Full address" />
            </div>
          </div>
        </Modal>
      )}

      {/* Purchase History Modal */}
      {showHistory && selectedCustomer && (
        <Modal
          title={`Purchase History — ${selectedCustomer.name}`}
          onClose={() => setShowHistory(false)}
          size="lg"
        >
          {loadingBills ? (
            <TableSkeleton rows={4} cols={4} />
          ) : customerBills.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500">No purchase history found for this customer</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="table-header">
                <tr>
                  <th className="th">Bill No</th>
                  <th className="th">Date</th>
                  <th className="th">Doctor</th>
                  <th className="th text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerBills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="td font-bold text-green-700">#{b.serial_no}</td>
                    <td className="td text-slate-600">{formatDateDisplay(b.bill_date)}</td>
                    <td className="td text-slate-600">{b.doctor_name || '—'}</td>
                    <td className="td text-right font-semibold text-slate-900">{formatCurrency(Number(b.grand_total))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-green-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 font-bold text-slate-700 text-right">Total Spent</td>
                  <td className="px-4 py-3 text-right font-bold text-green-700">
                    {formatCurrency(customerBills.reduce((s, b) => s + Number(b.grand_total), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </Modal>
      )}
    </div>
  );
}
