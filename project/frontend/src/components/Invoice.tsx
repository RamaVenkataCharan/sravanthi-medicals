import { useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/utils';
import { STORE_INFO } from '../lib/constants';

interface InvoiceProps {
  bill: any;
  onClose: () => void;
}

export default function Invoice({ bill, onClose }: InvoiceProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!bill) return null;

  return (
    <>
      {/* Screen overlay (hidden on print) */}
      <div className="fixed inset-0 bg-black/60 z-50 print:hidden" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-start justify-center p-6 print:p-0 print:block print:inset-auto pointer-events-none">
        
        {/* On-screen controls */}
        <div className="absolute top-4 right-4 flex gap-3 print:hidden pointer-events-auto">
           <button onClick={() => window.print()} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-colors">
             <Printer size={18} /> Print Thermal
           </button>
           <button onClick={onClose} className="bg-white text-slate-700 p-2.5 rounded-xl shadow-lg hover:bg-slate-50 transition-colors">
             <X size={20} />
           </button>
        </div>

        {/* --- THERMAL INVOICE --- */}
        <div className="bg-white p-4 w-[80mm] mx-auto text-black pointer-events-auto print:shadow-none print:m-0 print:w-[80mm]" style={{ fontFamily: 'monospace' }}>
          
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold leading-tight uppercase">{STORE_INFO.name}</h2>
            <p className="text-xs leading-tight mt-1">{STORE_INFO.fullAddress}</p>
            <p className="text-[10px] mt-1">DL: {STORE_INFO.licenses.form20}</p>
          </div>

          <div className="border-t border-b border-black py-2 mb-3 text-xs leading-tight">
            <div className="flex justify-between mb-1">
              <span>Bill: #{bill.serial_no}</span>
              <span>{formatDate(bill.date)}</span>
            </div>
            {bill.customer_id && <div>Cust ID: {bill.customer_id}</div>}
          </div>

          <table className="w-full text-xs text-left mb-3">
            <thead>
              <tr className="border-b border-black font-bold">
                <th className="pb-1" style={{ width: '55%' }}>Item</th>
                <th className="pb-1 text-center" style={{ width: '15%' }}>Qty</th>
                <th className="pb-1 text-right" style={{ width: '30%' }}>Price</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {bill.items?.map((item: any, i: number) => (
                <tr key={i} className="border-b border-gray-300 border-dashed last:border-0">
                  <td className="py-2 pr-1">
                    <div className="font-bold">{item.name || item.drug_name || 'Medicine'}</div>
                    <div className="text-[10px] mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">B: {item.batch_no} | GST: {item.gst_percentage}%</div>
                  </td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">{formatCurrency(item.total).replace('₹', '')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-black pt-2 text-xs">
             <div className="flex justify-between mb-1">
               <span>Subtotal</span>
               <span>{formatCurrency(bill.subtotal || 0).replace('₹', '')}</span>
             </div>
             <div className="flex justify-between mb-2">
               <span>GST Info</span>
               <span>{formatCurrency(bill.gst_total || 0).replace('₹', '')}</span>
             </div>
             <div className="flex justify-between font-bold text-sm mt-1 border-t border-black pt-2">
               <span>TOTAL</span>
               <span>{formatCurrency(bill.total_amount || bill.grand_total || 0).replace('₹', '')}</span>
             </div>
          </div>

          <div className="text-center text-[10px] mt-6 pt-3 border-t border-black">
            <p className="font-bold">Prices inclusive of all taxes</p>
            <p className="mt-1">Thank you for visiting!</p>
          </div>
          
          {/* Thermal CSS Override */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              @page { margin: 0; size: 80mm auto; }
              body { width: 80mm; margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; }
            }
          `}} />
        </div>
      </div>
    </>
  );
}
