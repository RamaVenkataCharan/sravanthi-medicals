import { useState, useEffect } from 'react';
import { AlertTriangle, CalendarClock, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Medicine } from '../lib/database.types';
import { formatDate, formatCurrency, isExpired, getDaysUntilExpiry } from '../utils/utils';
import Badge from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';

type ExpiryTab = '30' | '60' | '90' | 'expired';

const TABS: { id: ExpiryTab; label: string; days: number | null; color: string }[] = [
  { id: 'expired', label: 'Expired',    days: null, color: 'red'   },
  { id: '30',      label: 'Within 30d', days: 30,   color: 'red'   },
  { id: '60',      label: 'Within 60d', days: 60,   color: 'amber' },
  { id: '90',      label: 'Within 90d', days: 90,   color: 'yellow'},
];

export default function ExpiryManagement() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ExpiryTab>('expired');

  useEffect(() => { loadMedicines(); }, []);

  async function loadMedicines() {
    setLoading(true);
    const { data } = await supabase
      .from('medicines')
      .select('*')
      .order('expiry_date', { ascending: true });
    if (data) setMedicines(data);
    setLoading(false);
  }

  function getItems(tab: ExpiryTab): Medicine[] {
    if (tab === 'expired') return medicines.filter((m) => isExpired(m.expiry_date));
    const days = parseInt(tab);
    return medicines.filter((m) => {
      const d = getDaysUntilExpiry(m.expiry_date);
      return d >= 0 && d <= days;
    });
  }

  const counts = {
    expired: medicines.filter((m) => isExpired(m.expiry_date)).length,
    '30': medicines.filter((m) => { const d = getDaysUntilExpiry(m.expiry_date); return d >= 0 && d <= 30; }).length,
    '60': medicines.filter((m) => { const d = getDaysUntilExpiry(m.expiry_date); return d >= 0 && d <= 60; }).length,
    '90': medicines.filter((m) => { const d = getDaysUntilExpiry(m.expiry_date); return d >= 0 && d <= 90; }).length,
  };

  const items = getItems(activeTab);

  const badgeVariant = (m: Medicine) => {
    if (isExpired(m.expiry_date)) return 'expired' as const;
    const d = getDaysUntilExpiry(m.expiry_date);
    if (d <= 30) return 'critical' as const;
    return 'warning' as const;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="page-title">Expiry Management</h2>
        <p className="page-subtitle">Monitor and manage medicine expiry dates</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`card p-4 text-left transition-all hover:shadow-card-hover ${activeTab === tab.id ? 'ring-2 ring-green-500' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">{tab.label}</span>
              {tab.id === 'expired'
                ? <AlertTriangle className="h-4 w-4 text-red-500" />
                : <CalendarClock className="h-4 w-4 text-amber-500" />
              }
            </div>
            {loading
              ? <div className="skeleton h-7 w-10 rounded" />
              : <p className={`text-2xl font-bold ${counts[tab.id] > 0 ? (tab.id === 'expired' ? 'text-red-600' : 'text-amber-600') : 'text-slate-900'}`}>
                  {counts[tab.id]}
                </p>
            }
            <p className="text-xs text-slate-500 mt-1">
              {counts[tab.id] === 0 ? 'All clear' : 'items need attention'}
            </p>
          </button>
        ))}
      </div>

      {/* Tab filter buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? tab.id === 'expired' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/25' : 'bg-slate-200'}`}>
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          {activeTab === 'expired'
            ? <AlertTriangle className="h-4 w-4 text-red-500" />
            : <CalendarClock className="h-4 w-4 text-amber-500" />
          }
          <h3 className="font-semibold text-slate-900 text-sm">
            {activeTab === 'expired' ? 'Expired Medicines' : `Medicines Expiring Within ${activeTab} Days`}
          </h3>
          <span className="ml-auto text-xs text-slate-500">{items.length} items</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="th">Drug Name</th>
                <th className="th">Manufacturer</th>
                <th className="th">Batch No</th>
                <th className="th">Expiry Date</th>
                <th className="th text-center">Days Left</th>
                <th className="th text-right">MRP</th>
                <th className="th text-center">Stock</th>
                <th className="th text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={8}><TableSkeleton rows={5} cols={8} /></td></tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-700">No expiry alerts</p>
                    <p className="text-xs text-slate-500 mt-1">All medicines in this range are fine</p>
                  </td>
                </tr>
              ) : (
                items.map((med) => {
                  const days = getDaysUntilExpiry(med.expiry_date);
                  const expired = isExpired(med.expiry_date);
                  return (
                    <tr
                      key={med.id}
                      className={`transition-colors ${expired ? 'bg-red-50/60 hover:bg-red-50' : days <= 30 ? 'bg-amber-50/40 hover:bg-amber-50' : 'hover:bg-slate-50'}`}
                    >
                      <td className="td font-semibold text-slate-900">{med.drug_name}</td>
                      <td className="td text-slate-600">{med.manufacturer}</td>
                      <td className="td text-slate-600 font-mono text-xs">{med.batch_no}</td>
                      <td className="td text-slate-700">{formatDate(med.expiry_date)}</td>
                      <td className="td text-center">
                        <span className={`font-bold ${expired ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-slate-700'}`}>
                          {expired ? 'EXPIRED' : `${days}d`}
                        </span>
                      </td>
                      <td className="td text-right font-semibold text-slate-800">{formatCurrency(Number(med.mrp))}</td>
                      <td className="td text-center font-semibold text-slate-700">{med.current_stock}</td>
                      <td className="td text-center">
                        <Badge variant={badgeVariant(med)}>
                          {expired ? 'EXPIRED' : days <= 30 ? 'Critical' : 'Near Expiry'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
