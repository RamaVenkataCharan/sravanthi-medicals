import api from './api';

export interface Medicine {
  id: number;
  name: string;
  manufacturer: string;
  gst_percentage: number;
}

export const searchMedicines = async (q: string): Promise<Medicine[]> => {
  const res = await api.get(`/api/medicines/pro-search?q=${encodeURIComponent(q)}`);
  return res.data;
};

export const getMedicines = async (): Promise<Medicine[]> => {
  const res = await api.get('/api/medicines/');
  return res.data;
};
