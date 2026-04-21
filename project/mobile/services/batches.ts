import api from './api';

export interface Batch {
  id: number;
  medicine_id: number;
  batch_no: string;
  expiry_date: string;
  stock_quantity: number;
  mrp: number;
  medicine?: {
    id: number;
    name: string;
    manufacturer: string;
    gst_percentage: number;
  };
}

export const getBatches = async (medicine_id?: number): Promise<Batch[]> => {
  const params = medicine_id ? `?medicine_id=${medicine_id}` : '';
  const res = await api.get(`/api/batches/${params}`);
  return res.data;
};
