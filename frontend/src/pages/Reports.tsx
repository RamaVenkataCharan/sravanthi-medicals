import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Package } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
  Cell,
} from 'recharts';
import { supabase } from '../lib/supabase';
import type { Medicine, Bill } from '../lib/database.types';
import { formatCurrency, formatCurrencyCompact, isLowStock, getDaysUntilExpiry, isExpired } from '../utils/utils';
import { STOCK_ALERT_THRESHOLD } from '../lib/constants';
import { format, subDays } from 'date-fns';

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg min-w-[120px]">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.name.toLowerCase().includes('revenue') ? formatCurrency(p.value) : p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);
  const [topMedicines, setTopMedicines] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBills, setTotalBills] = useState(0);

  useEffect(() => { loadReports(); }, []);

  async function loadReports() {
    setLoading(true);
    try {
      const thirtyDaysAgo = format(subDays(new Date(), 29), 'yyyy-MM-dd');

      const [billsRes, itemsRes, medRes] = await Promise.all([
        supabase.from('bills').select('grand_total, bill_date').gte('bill_date', thirtyDaysAgo),
        supabase.from('bill_items').select('drug_name, quantity, row_total'),
        supabase.from('medicines').select('*').order('drug_name'),
      ]);

      if (billsRes.data) {
        setTotalRevenue(billsRes.data.reduce((s, b) => s + Number(b.grand_total), 0));
        setTotalBills(billsRes.data.length);

        // Last 14 days chart
        const revenueMap: Record<string, number> = {};
        for (let i = 13; i >= 0; i--) {
          const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
          revenueMap[d] = 0;
        }
        billsRes.data.forEach((b) => {
          if (b.bill_date in revenueMap) revenueMap[b.bill_date] += Number(b.grand_total);
        });
        setDailyRevenue(Object.entries(revenueMap).map(([date, revenue]) => ({
          day: format(new Date(date + 'T00:00:00'), 'dd MMM'),
          revenue,
        })));
      }

      if (itemsRes.data) {
        // Top selling medicines by quantity
        const medMap: Record<string, { quantity: number; revenue: number }> = {};
        itemsRes.data.forEach((item) => {
          if (!medMap[item.drug_name]) medMap[item.drug_name] = { quantity: 0, revenue: 0 };
          medMap[item.drug_name].quantity += item.quantity;
          medMap[item.drug_name].revenue += Number(item.row_total);
        });
        const top = Object.entries(medMap)
          .sort((a, b) => b[1].quantity - a[1].quantity)
          .slice(0, 8)
          .map(([name, data]) => ({ name, ...data }));
        setTopMedicines(top);
      }

      if (medRes.data) {
        setLowStockItems(medRes.data.filter((m) => isLowStock(m.current_stock, STOCK_ALERT_THRESHOLD) && !isExpired(m.expiry_date)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7', '#f0fdf4', '#d1fae5'];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="page-title">Reports & Analytics</h2>
        <p className="page-subtitle">Last 30 days performance overview</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-500">30-Day Revenue</p>
            <div className="p-2 rounded-xl bg-green-50">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
          {loading ? <div className="skeleton h-8 w-32 rounded" /> : (
            <p className="text-2xl font-bold text-slate-900">{formatCurrencyCompact(totalRevenue)}</p>
          )}
          <p className="text-xs text-slate-500 mt-1">{formatCurrency(totalRevenue)} total</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-500">Total Bills</p>
            <div className="p-2 rounded-xl bg-blue-50">
              <BarChart2 className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          {loading ? <div className="skeleton h-8 w-20 rounded" /> : (
            <p className="text-2xl font-bold text-slate-900">{totalBills}</p>
          )}
          <p className="text-xs text-slate-500 mt-1">
            Avg: {totalBills > 0 ? formatCurrency(totalRevenue / totalBills) : '₹0.00'} per bill
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-500">Low Stock Items</p>
            <div className="p-2 rounded-xl bg-orange-50">
              <Package className="h-4 w-4 text-orange-600" />
            </div>
          </div>
          {loading ? <div className="skeleton h-8 w-16 rounded" /> : (
            <p className="text-2xl font-bold text-slate-900">{lowStockItems.length}</p>
          )}
          <p className="text-xs text-orange-500 mt-1">Need restocking</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">Daily Revenue — Last 14 Days</h3>
          <p className="text-xs text-slate-500 mt-0.5">Revenue trend over the past two weeks</p>
        </div>
        <div className="h-64">
          {loading ? (
            <div className="skeleton h-full w-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyRevenue}>
                <CartesianGrid stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} interval={1} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`} width={55} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3, fill: '#16a34a' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Medicines + Low Stock */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Top Selling */}
        <div className="card p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Top Selling Medicines</h3>
            <p className="text-xs text-slate-500 mt-0.5">By units sold (all time)</p>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="skeleton h-full w-full rounded-xl" />
            ) : topMedicines.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No sales data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topMedicines} layout="vertical" barSize={14}>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#475569' }} width={120} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Bar dataKey="quantity" name="Units Sold" radius={[0, 4, 4, 0]}>
                    {topMedicines.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Low Stock Report */}
        <div className="card overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-base font-semibold text-slate-900">Low Stock Report</h3>
            <p className="text-xs text-slate-500 mt-0.5">Medicines needing restock</p>
          </div>
          <div className="overflow-y-auto max-h-64">
            {loading ? (
              <div className="px-5 space-y-3 pb-3">
                {[0,1,2,3].map((i)=><div key={i} className="skeleton h-10 rounded" />)}
              </div>
            ) : lowStockItems.length === 0 ? (
              <div className="px-5 pb-10 pt-6 text-center">
                <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">All items well-stocked!</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="table-header">
                  <tr>
                    <th className="th">Medicine</th>
                    <th className="th text-right">MRP</th>
                    <th className="th text-center">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockItems.map((m) => (
                    <tr key={m.id} className="hover:bg-orange-50/50">
                      <td className="td">
                        <p className="font-medium text-slate-800">{m.drug_name}</p>
                        <p className="text-xs text-slate-500">{m.manufacturer}</p>
                      </td>
                      <td className="td text-right">{formatCurrency(Number(m.mrp))}</td>
                      <td className="td text-center">
                        <span className={`font-bold ${m.current_stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                          {m.current_stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
