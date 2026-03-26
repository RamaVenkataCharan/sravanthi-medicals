export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  medicines: {
    search: async (query: string) => {
      const res = await fetch(`${API_URL}/medicines/search?q=${query}`);
      if (!res.ok) throw new Error('Network error');
      return res.json();
    },
    proSearch: async (query: string) => {
      const res = await fetch(`${API_URL}/medicines/pro-search?q=${query}`);
      if (!res.ok) throw new Error('Network error');
      return res.json();
    },
    create: async (data: any) => {
      const res = await fetch(`${API_URL}/medicines/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Network error');
      return res.json();
    },
    getAll: async () => {
      const res = await fetch(`${API_URL}/medicines/`);
      if (!res.ok) throw new Error('Network error');
      return res.json();
    }
  }
};
