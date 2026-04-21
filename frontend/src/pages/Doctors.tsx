import { useState, useEffect } from 'react';
import { Plus, Search, Stethoscope, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { Doctor } from '../lib/database.types';
import Modal from '../components/ui/Modal';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';

const EMPTY_FORM = { name: '', address: '', phone: '' };

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadDoctors(); }, []);

  async function loadDoctors() {
    setLoading(true);
    const { data } = await supabase.from('doctors').select('*').order('name');
    if (data) setDoctors(data);
    setLoading(false);
  }

  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.phone && d.phone.includes(search)) ||
    (d.address && d.address.toLowerCase().includes(search.toLowerCase()))
  );

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(d: Doctor) {
    setEditing(d);
    setForm({ name: d.name, address: d.address || '', phone: d.phone || '' });
    setShowModal(true);
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Doctor name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await supabase.from('doctors').update({ name: form.name, address: form.address, phone: form.phone }).eq('id', editing.id);
        if (error) throw error;
        toast.success('Doctor updated!');
      } else {
        const { error } = await supabase.from('doctors').insert({ name: form.name, address: form.address, phone: form.phone });
        if (error) throw error;
        toast.success('Doctor added!');
      }
      setShowModal(false);
      loadDoctors();
    } catch { toast.error('Failed to save. Please try again.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="page-title">Doctor Database</h2>
          <p className="page-subtitle">{doctors.length} doctors — auto-fill available in Billing</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="h-4 w-4" />
          Add Doctor
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

      {/* Doctor cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0,1,2,3,4,5].map((i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-5 w-3/4 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Stethoscope className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No doctors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <div key={d.id} className="card p-5 hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{d.name}</p>
                    {d.phone && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <Phone className="h-3 w-3" /> {d.phone}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openEdit(d)}
                  className="flex-shrink-0 text-xs font-medium text-slate-500 hover:text-green-700 transition-colors"
                >
                  Edit
                </button>
              </div>
              {d.address && (
                <div className="flex items-start gap-1.5 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <span>{d.address}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editing ? 'Edit Doctor' : 'Add Doctor'}
          onClose={() => setShowModal(false)}
          size="sm"
          footer={
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : editing ? 'Update' : 'Add Doctor'}
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="label">Doctor Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Dr. Full Name" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="Mobile number" />
            </div>
            <div>
              <label className="label">Clinic / Hospital Address</label>
              <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field resize-none" placeholder="Hospital name and address" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
