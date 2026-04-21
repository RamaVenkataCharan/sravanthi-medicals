import api from './api';

export interface StoreSettings {
  id?: number;
  store_name: string;
  address: string;
  gst_number: string;
  printer_config: string;
}

export const getSettings = async (): Promise<StoreSettings> => {
  const res = await api.get('/api/settings/');
  return res.data;
};

export const updateSettings = async (settings: StoreSettings): Promise<StoreSettings> => {
  const res = await api.put('/api/settings/', settings);
  return res.data;
};
