import { useEffect } from 'react';
import { X, Printer } from 'lucide-react';
import type { Bill, BillItem } from '../lib/database.types';
import { formatDate, formatCurrency } from '../utils/utils';
import { STORE_INFO, BILL_FOOTER } from '../lib/constants';

interface PrintBillProps {
  bill: Bill;
  items: BillItem[];
  onClose: () => void;
}

export default function PrintBill({ bill, items, onClose }: PrintBillProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <>
      {/* Screen overlay (hidden on print) */}
      <div className="fixed inset-0 bg-black/60 z-50 print:hidden" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-start justify-center p-6 print:p-0 print:block print:inset-auto pointer-events-none">
        <div className="bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[95vh] overflow-y-auto pointer-events-auto print:shadow-none print:rounded-none print:max-w-none print:max-h-none print:overflow-visible">
          {/* Screen toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 print:hidden">
            <h2 className="font-semibold text-slate-900">Print Preview — Bill #{bill.serial_no}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="btn-primary"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ── Printable Content ─────────────────────────── */}
          <div id="printable-bill" className="p-8 print:p-6 font-sans">
            {/* Store Header */}
            <div className="text-center mb-6 pb-5 border-b-2 border-slate-800">
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                {STORE_INFO.name}
              </h1>
              <p className="text-sm text-slate-600 mt-1">{STORE_INFO.fullAddress}</p>
              <p className="text-xs text-slate-500 mt-1">
                {STORE_INFO.licenses.form20} &nbsp;|&nbsp; {STORE_INFO.licenses.form21}
              </p>
            </div>

            {/* Bill Info */}
            <div className="flex justify-between mb-5 text-sm">
              <div>
                <p><span className="font-semibold">Bill No:</span> #{bill.serial_no}</p>
                <p className="mt-0.5"><span className="font-semibold">Date:</span> {formatDate(bill.bill_date)}</p>
              </div>
              <div className="text-center border border-slate-300 px-4 py-2 rounded">
                <p className="text-xs text-slate-500 uppercase font-semibold">Cash Memo</p>
              </div>
            </div>

            {/* Customer + Doctor */}
            <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
              <div className="border border-slate-300 rounded p-3">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1.5">Patient / Customer</p>
                <p className="font-semibold">{bill.customer_name}</p>
                {bill.customer_address && <p className="text-slate-600 mt-0.5">{bill.customer_address}</p>}
                {bill.customer_phone && <p className="text-slate-600">Ph: {bill.customer_phone}</p>}
              </div>
              {bill.doctor_name ? (
                <div className="border border-slate-300 rounded p-3">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1.5">Prescribed By</p>
                  <p className="font-semibold">{bill.doctor_name}</p>
                  {bill.doctor_address && <p className="text-slate-600 mt-0.5">{bill.doctor_address}</p>}
                  {bill.doctor_phone && <p className="text-slate-600">Ph: {bill.doctor_phone}</p>}
                </div>
              ) : <div />}
            </div>

            {/* Medicine Table */}
            <table className="w-full border border-slate-700 mb-5 text-xs print:text-xs">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="border border-slate-600 px-2 py-1.5 text-left font-semibold">#</th>
                  <th className="border border-slate-600 px-2 py-1.5 text-left font-semibold">Drug Name</th>
                  <th className="border border-slate-600 px-2 py-1.5 text-left font-semibold">Mfr</th>
                  <th className="border border-slate-600 px-2 py-1.5 text-center font-semibold">Qty</th>
                  <th className="border border-slate-600 px-2 py-1.5 text-left font-semibold">Batch / Exp</th>
                  <th className="border border-slate-600 px-2 py-1.5 text-right font-semibold">MRP</th>
                  <th className="border border-slate-600 px-2 py-1.5 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-600">{i + 1}</td>
                    <td className="border border-slate-300 px-2 py-1.5 font-medium">{item.drug_name}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-slate-600">{item.manufacturer}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">{item.quantity}</td>
                    <td className="border border-slate-300 px-2 py-1.5">
                      <span>{item.batch_no}</span>
                      <br />
                      <span className="text-slate-500">Exp: {formatDate(item.expiry_date)}</span>
                    </td>
                    <td className="border border-slate-300 px-2 py-1.5 text-right">{formatCurrency(Number(item.mrp))}</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-right font-semibold">{formatCurrency(Number(item.row_total))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} className="border border-slate-700 px-2 py-1.5" />
                  <td className="border border-slate-700 px-2 py-1.5 text-right font-bold text-sm">Subtotal</td>
                  <td className="border border-slate-700 px-2 py-1.5 text-right font-bold text-sm">{formatCurrency(Number(bill.subtotal))}</td>
                </tr>
                <tr className="bg-slate-800 text-white">
                  <td colSpan={5} className="border border-slate-600 px-2 py-1.5" />
                  <td className="border border-slate-600 px-2 py-1.5 text-right font-black text-sm">GRAND TOTAL</td>
                  <td className="border border-slate-600 px-2 py-1.5 text-right font-black text-sm">{formatCurrency(Number(bill.grand_total))}</td>
                </tr>
              </tfoot>
            </table>

            {/* Footer */}
            <div className="space-y-2 text-xs text-slate-600 mb-6">
              <p className="font-medium">✓ {BILL_FOOTER.taxNote}</p>
              {items.some(item => item.drug_name?.toUpperCase().includes('SCHEDULE H')) && (
                <p className="text-red-700 font-semibold border border-red-300 p-2 rounded">
                  {BILL_FOOTER.scheduleH}
                </p>
              )}
            </div>

            {/* Signature */}
            <div className="flex justify-between items-end mt-10 pt-5 border-t border-slate-300">
              <div>
                <p className="text-xs text-slate-500">{BILL_FOOTER.thankYou}</p>
              </div>
              <div className="text-right">
                <div className="h-12 border-b border-slate-600 w-40 mb-1" />
                <p className="text-xs text-slate-600">{BILL_FOOTER.signature}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
