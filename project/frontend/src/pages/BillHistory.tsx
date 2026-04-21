import { useState, useEffect } from 'react';
import { Search, Printer, FileText } from 'lucide-react';
import Invoice from '../components/Invoice';
import { formatDate, formatCurrency } from '../utils/utils';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function BillHistory() {
  const [bills, setBills] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBills(); }, []);

  async function loadBills() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bills/`);
      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setBills(sorted);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const filtered = bills.filter((b) =>
    (b.serial_no && b.serial_no.toString().toLowerCase().includes(search.toLowerCase())) ||
    (b.customer_id && b.customer_id.toString().includes(search))
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="page-title">Bill History</h2>
          <p className="page-subtitle">{bills.length} total bills</p>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bill no..."
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="th py-3">Bill No</th>
                <th className="th py-3">Date</th>
                <th className="th py-3 text-right">Items</th>
                <th className="th py-3 text-right">Subtotal</th>
                <th className="th py-3 text-right">GST</th>
                <th className="th py-3 text-right">Grand Total</th>
                <th className="th py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7}><TableSkeleton rows={6} cols={7} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No bills found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors py-2">
                    <td className="td">
                      <span className="font-bold text-slate-800">#{bill.serial_no}</span>
                    </td>
                    <td className="td text-slate-600">{formatDate(bill.date)}</td>
                    <td className="td text-right text-slate-600">{bill.items?.length || 0} items</td>
                    <td className="td text-right text-slate-500">{formatCurrency(bill.subtotal || 0)}</td>
                    <td className="td text-right text-slate-500">{formatCurrency(bill.gst_total || 0)}</td>
                    <td className="td text-right font-bold text-green-700">
                      {formatCurrency(bill.total_amount)}
                    </td>
                    <td className="td">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50 border border-blue-200 transition-colors"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          View & Print
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

      {/* Print */}
      {selectedBill && (
        <Invoice
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}
    </div>
  );
}
