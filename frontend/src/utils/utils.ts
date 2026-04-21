import { format, parseISO, differenceInDays } from 'date-fns';

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd-MM-yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateDisplay(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd MMM yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd MMM yyyy, hh:mm a');
  } catch {
    return dateString;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

export function getDaysUntilExpiry(expiryDate: string): number {
  try {
    return differenceInDays(parseISO(expiryDate), new Date());
  } catch {
    return 0;
  }
}

export function isExpired(expiryDate: string): boolean {
  return getDaysUntilExpiry(expiryDate) < 0;
}

export function isNearExpiry(expiryDate: string, days = 90): boolean {
  const d = getDaysUntilExpiry(expiryDate);
  return d >= 0 && d <= days;
}

export function isLowStock(stock: number, threshold = 10): boolean {
  return stock < threshold;
}

export function calculateRowTotal(quantity: number, mrp: number): number {
  return parseFloat((quantity * mrp).toFixed(2));
}

export type ExpiryStatus = 'expired' | 'critical' | 'warning' | 'ok';
export type StockStatus = 'out' | 'low' | 'ok';

export function getExpiryStatus(expiryDate: string): ExpiryStatus {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return 'expired';
  if (days <= 30) return 'critical';
  if (days <= 90) return 'warning';
  return 'ok';
}

export function getStockStatus(stock: number, threshold = 10): StockStatus {
  if (stock === 0) return 'out';
  if (stock < threshold) return 'low';
  return 'ok';
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}
