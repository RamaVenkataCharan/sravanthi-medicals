import api from './api';

export interface BillItem {
  batch_id: number;
  quantity: number;
}

export interface BillCreate {
  customer_name: string;
  doctor_name?: string;
  payment_mode: string;
  items: BillItem[];
}

export interface BillItemOut {
  id: number;
  batch_id: number;
  quantity: number;
  price: number;
  base_price: number;
  gst_percentage: number;
  gst_amount: number;
  total: number;
  batch?: {
    id: number;
    batch_no: string;
    expiry_date: string;
    mrp: number;
    medicine?: {
      name: string;
      manufacturer: string;
    };
  };
}

export interface Bill {
  id: number;
  serial_no: string;
  customer_name: string;
  doctor_name?: string;
  payment_mode: string;
  subtotal: number;
  gst_total: number;
  total_amount: number;
  created_at: string;
  items: BillItemOut[];
}

export const createBill = async (bill: BillCreate): Promise<Bill> => {
  const res = await api.post('/api/bills/', bill);
  return res.data;
};

export const getBills = async (): Promise<Bill[]> => {
  const res = await api.get('/api/bills/');
  return res.data;
};
