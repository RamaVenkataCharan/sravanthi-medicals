import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Package, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate, formatCurrency, isExpired, isLowStock, getExpiryStatus, getStockStatus, getDaysUntilExpiry } from '../../utils/utils';
import { STOCK_ALERT_THRESHOLD } from '../../lib/constants';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';

type FilterTab = 'all' | 'lowstock' | 'nearexpiry' | 'expired';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'lowstock', label: 'Low Stock' },
  { id: 'nearexpiry', label: 'Near Expiry' },
  { id: 'expired', label: 'Expired' },
];

interface InventoryBatch {
  batchId: number;
  medicineId: number;
  drug_name: string;
  manufacturer: string;
  batch_no: string;
  expiry_date: string;
  mrp: number;
  stock_quantity: number;
}

export default function InventoryPage() {
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadInventory(); }, []);

  async function loadInventory() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/medicines/`);
      if(res.ok) {
        const data = await res.json();
        const flatList: InventoryBatch[] = [];
        data.forEach((m: any) => {
          m.batches.forEach((b: any) => {
             flatList.push({
               batchId: b.id,
               medicineId: m.id,
               drug_name: m.name,
               manufacturer: m.manufacturer,
               batch_no: b.batch_no,
               expiry_date: b.expiry_date,
               mrp: b.mrp,
               stock_quantity: b.stock_quantity
             });
          });
        });
        setBatches(flatList.sort((a,b) => a.drug_name.localeCompare(b.drug_name)));
      }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  const filtered = batches
    .filter((m) => {
      const q = search.toLowerCase();
      return (
        m.drug_name.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q) ||
        m.batch_no.toLowerCase().includes(q)
      );
    })
    .filter((m) => {
      if (activeTab === 'lowstock') return isLowStock(m.stock_quantity, STOCK_ALERT_THRESHOLD);
      if (activeTab === 'nearexpiry') return !isExpired(m.expiry_date) && getDaysUntilExpiry(m.expiry_date) <= 90;
      if (activeTab === 'expired') return isExpired(m.expiry_date);
      return true;
    });

  const counts = {
    all: batches.length,
    lowstock: batches.filter((m) => isLowStock(m.stock_quantity, STOCK_ALERT_THRESHOLD)).length,
    nearexpiry: batches.filter((m) => !isExpired(m.expiry_date) && getDaysUntilExpiry(m.expiry_date) <= 90).length,
    expired: batches.filter((m) => isExpired(m.expiry_date)).length,
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="page-title">Inventory</h2>
          <p className="page-subtitle">{batches.length} batches in stock</p>
        </div>
      </div>

      {/* Search + Tabs */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search drug name, manufacturer, or batch no…" className="input-field pl-9" />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          <Filter className="h-4 w-4 text-slate-400 flex-shrink-0 mr-1" />
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {tab.label}
              {counts[tab.id] > 0 && tab.id !== 'all' && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>{counts[tab.id]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header"><tr><th className="th py-3">Drug Name</th><th className="th">Batch No</th><th className="th">Expiry</th><th className="th text-right">MRP</th><th className="th text-center">Stock</th><th className="th text-center">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (<tr><td colSpan={6}><TableSkeleton rows={6} cols={6} /></td></tr>) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center"><Package className="h-8 w-8 text-slate-300 mx-auto mb-2" /><p className="text-sm text-slate-500">No batches found</p></td></tr>
              ) : (
                filtered.map((m) => {
                  const expStatus = getExpiryStatus(m.expiry_date);
                  const stStatus = getStockStatus(m.stock_quantity, STOCK_ALERT_THRESHOLD);
                  const days = getDaysUntilExpiry(m.expiry_date);
                  return (
                    <tr key={m.batchId} className="hover:bg-slate-50 py-2">
                      <td className="td font-semibold text-slate-900">{m.drug_name}<div className="text-xs font-normal text-slate-500">{m.manufacturer}</div></td>
                      <td className="td text-slate-600 font-mono text-xs">{m.batch_no}</td>
                      <td className="td"><div className="text-sm text-slate-700">{formatDate(m.expiry_date)}</div>{expStatus !== 'expired' && expStatus !== 'ok' && (<div className="text-xs text-amber-600">{days}d left</div>)}</td>
                      <td className="td text-right font-semibold text-slate-800">{formatCurrency(m.mrp)}</td>
                      <td className="td text-center"><span className={`font-bold ${stStatus !== 'ok' ? 'text-orange-600' : 'text-slate-800'}`}>{m.stock_quantity}</span></td>
                      <td className="td text-center">
                        {expStatus === 'expired' ? <Badge variant="expired">EXPIRED</Badge> :
                         expStatus === 'warning' ? <Badge variant="warning">Near Expiry</Badge> :
                         stStatus === 'out' ? <Badge variant="out">Out</Badge> :
                         stStatus === 'low' ? <Badge variant="low">Low Stock</Badge> : <Badge variant="ok">OK</Badge>}
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
