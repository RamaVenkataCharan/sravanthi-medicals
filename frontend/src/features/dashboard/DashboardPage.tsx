import { useEffect, useState } from 'react';
import {
  TrendingUp, AlertTriangle, Package, ClipboardList,
  ShoppingCart, BarChart2, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { supabase } from '../../lib/supabase';
import type { Medicine, Bill } from '../../lib/database.types';
import {
  formatCurrency,
  formatCurrencyCompact,
  isExpired,
  isNearExpiry,
  isLowStock,
  formatDate,
  getDaysUntilExpiry,
  getExpiryStatus,
  getStockStatus,
} from '../../utils/utils';
import { STOCK_ALERT_THRESHOLD } from '../../lib/constants';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import type { PageId } from '../../lib/constants';
import { format, subDays } from 'date-fns';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
}

interface DailyRevenue {
  day: string;
  revenue: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-green-400 mt-0.5">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [todaySales, setTodaySales] = useState(0);
  const [totalBillsToday, setTotalBillsToday] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<Medicine[]>([]);
  const [nearExpiryItems, setNearExpiryItems] = useState<Medicine[]>([]);
  const [expiredItems, setExpiredItems] = useState<Medicine[]>([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<DailyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const sevenDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd');

      const [billsRes, medicinesRes] = await Promise.all([
        supabase
          .from('bills')
          .select('grand_total, bill_date')
          .gte('bill_date', sevenDaysAgo),
        supabase
          .from('medicines')
          .select('*')
          .order('expiry_date', { ascending: true }),
      ]);

      if (billsRes.data) {
        const todayBills = billsRes.data.filter((b) => b.bill_date === today);
        setTodaySales(todayBills.reduce((sum, b) => sum + Number(b.grand_total), 0));
        setTotalBillsToday(todayBills.length);

        // Build last 7 days revenue chart
        const revenueMap: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
          const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
          revenueMap[d] = 0;
        }
        billsRes.data.forEach((b) => {
          const d = b.bill_date;
          if (d in revenueMap) revenueMap[d] += Number(b.grand_total);
        });
        const chartData: DailyRevenue[] = Object.entries(revenueMap).map(([date, revenue]) => ({
          day: format(new Date(date + 'T00:00:00'), 'EEE'),
          revenue,
        }));
        setWeeklyRevenue(chartData);
      }

      if (medicinesRes.data) {
        setLowStockItems(medicinesRes.data.filter((m) => isLowStock(m.current_stock, STOCK_ALERT_THRESHOLD)));
        setNearExpiryItems(medicinesRes.data.filter((m) => isNearExpiry(m.expiry_date, 90) && !isExpired(m.expiry_date)));
        setExpiredItems(medicinesRes.data.filter((m) => isExpired(m.expiry_date)));
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  }

  const expiryAlerts = [...expiredItems, ...nearExpiryItems].slice(0, 8);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          label="Today's Sales"
          value={loading ? '—' : formatCurrencyCompact(todaySales)}
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          trend={{ value: `${totalBillsToday} bill${totalBillsToday !== 1 ? 's' : ''} today`, positive: true }}
          onClick={() => onNavigate('billing')}
          loading={loading}
        />
        <StatCard
          label="Low Stock Alerts"
          value={loading ? '—' : lowStockItems.length}
          icon={Package}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          trend={{ value: `Below ${STOCK_ALERT_THRESHOLD} units`, positive: lowStockItems.length === 0 }}
          onClick={() => onNavigate('inventory')}
          loading={loading}
        />
        <StatCard
          label="Near Expiry"
          value={loading ? '—' : nearExpiryItems.length}
          icon={AlertTriangle}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          trend={{ value: 'Expiring in 90 days', positive: nearExpiryItems.length === 0 }}
          onClick={() => onNavigate('expiry')}
          loading={loading}
        />
        <StatCard
          label="Expired Items"
          value={loading ? '—' : expiredItems.length}
          icon={ClipboardList}
          iconColor="text-red-600"
          iconBg="bg-red-50"
          trend={{ value: 'Need immediate removal', positive: expiredItems.length === 0 }}
          onClick={() => onNavigate('expiry')}
          loading={loading}
        />
      </div>

      {/* ── Charts + Alerts Row ──────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Weekly Revenue Chart */}
        <div className="card xl:col-span-3">
          <div className="px-5 pt-5 pb-2 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Weekly Revenue</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 7 days</p>
            </div>
            <BarChart2 className="h-5 w-5 text-slate-400" />
          </div>
          <div className="px-2 pb-4 h-52">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="skeleton h-40 w-full rounded-xl" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyRevenue} barSize={32}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`}
                    width={50}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {weeklyRevenue.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={index === weeklyRevenue.length - 1 ? '#16a34a' : '#bbf7d0'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="xl:col-span-2 space-y-3">
          <div className="card p-5">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {([
                { label: 'Create New Bill', page: 'billing', icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Manage Inventory', page: 'inventory', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'View Reports', page: 'reports', icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Expiry Monitor', page: 'expiry', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
              ] as const).map(({ label, page, icon: Icon, color, bg }) => (
                <button
                  key={page}
                  onClick={() => onNavigate(page as PageId)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all duration-150 group"
                >
                  <div className={`p-1.5 rounded-lg ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <span className="flex-1 text-left text-sm font-medium text-slate-700">{label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Alert Tables ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Low Stock */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Low Stock Items</h3>
              <p className="text-xs text-slate-500 mt-0.5">Stock below {STOCK_ALERT_THRESHOLD} units</p>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {loading ? (
              [0, 1, 2].map((i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <div className="skeleton flex-1 h-4 rounded" />
                  <div className="skeleton h-5 w-14 rounded" />
                </div>
              ))
            ) : lowStockItems.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">All items are well-stocked</p>
              </div>
            ) : (
              lowStockItems.slice(0, 8).map((item) => {
                const stockSt = getStockStatus(item.current_stock, STOCK_ALERT_THRESHOLD);
                return (
                  <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.drug_name}</p>
                      <p className="text-xs text-slate-500">{item.manufacturer}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant={stockSt === 'out' ? 'out' : 'low'}>
                        {item.current_stock} {item.current_stock === 0 ? 'OUT' : 'left'}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Expiry Alerts */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Expiry Alerts</h3>
              <p className="text-xs text-slate-500 mt-0.5">Expired & expiring soon</p>
            </div>
            <button
              onClick={() => onNavigate('expiry')}
              className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {loading ? (
              [0, 1, 2].map((i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <div className="skeleton flex-1 h-4 rounded" />
                  <div className="skeleton h-5 w-14 rounded" />
                </div>
              ))
            ) : expiryAlerts.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <AlertTriangle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No expiry alerts</p>
              </div>
            ) : (
              expiryAlerts.map((item) => {
                const status = getExpiryStatus(item.expiry_date);
                const days = getDaysUntilExpiry(item.expiry_date);
                return (
                  <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.drug_name}</p>
                      <p className="text-xs text-slate-500">{formatDate(item.expiry_date)}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant={status === 'expired' ? 'expired' : status === 'critical' ? 'critical' : 'warning'}>
                        {status === 'expired' ? 'EXPIRED' : `${days}d left`}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
