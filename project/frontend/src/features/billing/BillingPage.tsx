import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Save, Search, User, Hash, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, calculateRowTotal, formatDate } from '../../utils/utils';
import { STORE_INFO } from '../../lib/constants';
import Invoice from '../../components/Invoice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface Batch {
  id: number;
  batch_no: string;
  expiry_date: string;
  mrp: number;
  stock_quantity: number;
}

interface Suggestion {
  medicineId: number;
  batchId: number;
  name: string;
  manufacturer: string;
  batch_no: string;
  expiry_date: string;
  mrp: number;
  stock_quantity: number;
}

interface BillRow extends Suggestion {
  rowId: string;
  quantity: number;
  row_total: number;
}

export default function BillingPage() {
  const [billRows, setBillRows] = useState<BillRow[]>([]);
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSug, setShowSug] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [serialNo, setSerialNo] = useState<number>(0);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const [printedBill, setPrintedBill] = useState<any>(null);

  useEffect(() => {
    // Generate random serial no locally as default
    setSerialNo(Math.floor(Math.random() * 100000));
  }, []);

  // Debounced search
  useEffect(() => {
    if (search.length < 2) {
      setSuggestions([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/medicines/search?q=${search}`);
        if(res.ok) {
           const meds = await res.json();
           const flatSug: Suggestion[] = [];
           for(const m of meds) {
             for(const b of m.batches) {
               flatSug.push({
                 medicineId: m.id,
                 batchId: b.id,
                 name: m.name,
                 manufacturer: m.manufacturer,
                 batch_no: b.batch_no,
                 expiry_date: b.expiry_date,
                 mrp: b.mrp,
                 stock_quantity: b.stock_quantity
               });
             }
           }
           setSuggestions(flatSug);
        }
      } catch(e) { console.error(e); }
    }, 300);
    return () => clearTimeout(delay);
  }, [search]);

  function addRow(sug: Suggestion) {
    if(sug.stock_quantity <= 0) {
       toast.error('Out of stock!');
       return;
    }
    setBillRows(prev => {
      const existing = prev.find(r => r.batchId === sug.batchId);
      if (existing) {
        if (existing.quantity >= sug.stock_quantity) {
           toast.error('Max stock reached'); return prev;
        }
        return prev.map(r => r.batchId === sug.batchId ? {
          ...r, quantity: r.quantity + 1, row_total: calculateRowTotal(r.quantity + 1, r.mrp)
        } : r);
      }
      return [...prev, { ...sug, rowId: crypto.randomUUID(), quantity: 1, row_total: sug.mrp }];
    });
    setSearch('');
    setShowSug(false);
  }

  function updateQty(id: string, qty: number) {
     if (qty <= 0) { setBillRows(prev => prev.filter(r => r.rowId !== id)); return; }
     setBillRows(prev => prev.map(r => {
        if(r.rowId === id) {
           if(qty > r.stock_quantity) { toast.error(`Only ${r.stock_quantity} available`); return r;}
           return { ...r, quantity: qty, row_total: calculateRowTotal(qty, r.mrp) };
        }
        return r;
     }));
  }

  async function saveBill() {
    if (billRows.length === 0) return toast.error('No items');
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/bills/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName || null,
          doctor_name: doctorName || null,
          payment_mode: paymentMode,
          items: billRows.map(r => ({ batch_id: r.batchId, quantity: r.quantity }))
        })
      });
      if (!res.ok) {
         const err = await res.json();
         throw new Error(err.detail || 'Save failed');
      }
      const savedBill = await res.json();
      toast.success('Bill generated successfully!');
      
      // Reset Form
      setBillRows([]);
      setCustomerName('');
      setCustomerPhone('');
      setDoctorName('');
      setPaymentMode('Cash');
      setSerialNo(Math.floor(Math.random() * 100000));
      
      // Open Printable Invoice Template
      setPrintedBill(savedBill);
      
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  const subtotal = billRows.reduce((sum, r) => sum + r.row_total, 0);

  return (
    <div className="space-y-5 animate-fade-in">
       {/* UI Elements */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">{STORE_INFO.name}</h2>
            <p className="text-xs text-slate-500">{STORE_INFO.fullAddress}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-slate-400" />
              <span className="font-semibold text-slate-900">Bill #{serialNo}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-slate-200" />
            <span>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Customer */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-800">Customer Details (Optional)</h3>
            </div>
               <input type="text" placeholder="Name" value={customerName} onChange={e=>setCustomerName(e.target.value)} className="input-field mb-2" />
               <input type="tel" placeholder="Phone" value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} className="input-field mb-2" />
               <input type="text" placeholder="Dr. Name" value={doctorName} onChange={e=>setDoctorName(e.target.value)} className="input-field mb-2" />
               <select value={paymentMode} onChange={e=>setPaymentMode(e.target.value)} className="input-field">
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
               </select>
           </div>

           {/* Medicine Search */}
           <div className="card p-5 relative">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-800">Add Medicines</h3>
            </div>
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                 <input ref={searchRef} type="text" placeholder="Search drug, manufacturer..." value={search} onChange={e=>{setSearch(e.target.value); setShowSug(true);}} onFocus={()=>setShowSug(true)} onBlur={()=>setTimeout(()=>setShowSug(false), 200)} className="input-field pl-9" />
               </div>
               
               {showSug && search.length >= 2 && (
                   <div className="absolute z-30 left-0 right-0 max-h-80 overflow-y-auto bg-white border border-slate-200 shadow-xl mt-1 rounded-xl">
                      {suggestions.length === 0 ? <div className="p-4 text-sm text-slate-500 text-center">No medicines found.</div> : suggestions.map((s) => (
                         <div key={`${s.medicineId}-${s.batchId}`} onMouseDown={() => addRow(s)} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0">
                            <div className="flex justify-between">
                              <div>
                                 <div className="text-sm font-bold text-slate-800">{s.name}</div>
                                 <div className="text-xs text-slate-500">{s.manufacturer} · Batch: {s.batch_no} · exp: {formatDate(s.expiry_date)}</div>
                              </div>
                              <div className="text-right">
                                 <div className="text-sm font-bold text-green-700">{formatCurrency(s.mrp)}</div>
                                 <div className="text-xs text-slate-500">Stock: {s.stock_quantity}</div>
                              </div>
                            </div>
                         </div>
                      ))}
                   </div>
               )}
           </div>
       </div>

       {/* Bill items table */}
       {billRows.length > 0 && (
           <div className="card overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-800 text-white">
                      <tr className="text-xs uppercase tracking-wide">
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3">Batch</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">MRP</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-center">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {billRows.map(r => (
                           <tr key={r.rowId} className="hover:bg-slate-50">
                             <td className="px-4 py-3">
                                <p className="text-sm font-semibold text-slate-800">{r.name}</p>
                                <p className="text-xs text-slate-500">{r.manufacturer}</p>
                             </td>
                             <td className="px-4 py-3">
                                <p className="text-sm text-slate-700">{r.batch_no}</p>
                                <p className="text-xs text-slate-500">Exp: {formatDate(r.expiry_date)}</p>
                             </td>
                             <td className="px-4 py-3 text-center">
                                <input type="number" min="1" value={r.quantity} onChange={e=>updateQty(r.rowId, Number(e.target.value))} className="input-field w-20 py-1 text-center inline-block" />
                             </td>
                             <td className="px-4 py-3 text-right text-sm text-slate-700">{formatCurrency(r.mrp)}</td>
                             <td className="px-4 py-3 font-bold text-green-700 text-right">{formatCurrency(r.row_total)}</td>
                             <td className="px-4 py-3 text-center">
                                <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" onClick={()=>setBillRows(prev=>prev.filter(x=>x.rowId !== r.rowId))}><Trash2 size={16}/></button>
                             </td>
                           </tr>
                        ))}
                    </tbody>
                 </table>
               </div>
               <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                   <div className="flex items-center gap-6 text-lg font-bold text-slate-900">
                      <span>Grand Total</span>
                      <span className="text-green-700">{formatCurrency(subtotal)}</span>
                   </div>
                   <div className="flex gap-3">
                     <button onClick={() => setBillRows([])} className="btn-secondary"><X className="h-4 w-4" /> Clear</button>
                     <button onClick={saveBill} disabled={saving} className="btn-primary"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Bill'}</button>
                   </div>
               </div>
           </div>
       )}

      {billRows.length === 0 && (
        <div className="card p-12 text-center">
          <Plus className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No medicines added</p>
          <p className="text-sm text-slate-400 mt-1">Use the search above to find and add medicines to this bill</p>
        </div>
      )}

      {/* Spawns the invoice after save */}
      {printedBill && <Invoice bill={printedBill} onClose={() => setPrintedBill(null)} />}
    </div>
  );
}
