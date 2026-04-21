/**
 * useMedicineSearch — Debounced medicine catalog search hook
 *
 * Searches the medicine_catalog table with a 300ms debounce.
 * Tries FastAPI first (/api/medicines/search), falls back to Supabase direct.
 * Returns suggestions for billing autocomplete.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const FASTAPI_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const DEBOUNCE_MS = 300;
const MIN_QUERY_LEN = 2;

export interface CatalogSuggestion {
  id: string;
  drug_name: string;
  manufacturer: string;
  composition: string;
  pack_size: string;
  mrp: number;
  category: string;
  source: 'catalog' | 'inventory';
}

// In-memory client-side result cache
const _searchCache = new Map<string, CatalogSuggestion[]>();

async function searchViaFastAPI(query: string, signal: AbortSignal): Promise<CatalogSuggestion[]> {
  const url = `${FASTAPI_URL}/api/medicines/pro-search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  const searchResults = Array.isArray(json) ? json : (json.results ?? []);
  return searchResults.map((r: Record<string, unknown>) => ({
    id: String(r.id ?? ''),
    drug_name: String(r.name ?? r.drug_name ?? ''),
    manufacturer: String(r.manufacturer ?? ''),
    composition: String(r.composition ?? ''),
    pack_size: String(r.pack_size ?? ''),
    mrp: Number(r.price ?? r.mrp ?? 0),
    category: String(r.category ?? 'Regular'),
    source: 'catalog' as const,
  }));
}

async function searchViaSupabase(query: string): Promise<CatalogSuggestion[]> {
  // medicine_catalog is created via migration; cast to bypass TS type check
  const { data, error } = await (supabase as any)
    .from('medicine_catalog')
    .select('id, drug_name, manufacturer, composition, pack_size, mrp, category')
    .ilike('drug_name', `%${query}%`)
    .order('drug_name')
    .limit(10);

  if (error) throw error;
  return ((data as any[]) ?? []).map((r) => ({
    id: String(r.id ?? ''),
    drug_name: String(r.drug_name ?? ''),
    manufacturer: String(r.manufacturer ?? ''),
    composition: String(r.composition ?? ''),
    pack_size: String(r.pack_size ?? ''),
    mrp: Number(r.mrp ?? 0),
    category: String(r.category ?? 'Regular'),
    source: 'catalog' as const,
  }));
}

export function useMedicineSearch(query: string) {
  const [suggestions, setSuggestions] = useState<CatalogSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Check FastAPI health once on mount
  useEffect(() => {
    fetch(`${FASTAPI_URL}/health`, { signal: AbortSignal.timeout(1500) })
      .then((r) => setApiAvailable(r.ok))
      .catch(() => setApiAvailable(false));
  }, []);

  const search = useCallback(
    async (q: string) => {
      if (q.length < MIN_QUERY_LEN) {
        setSuggestions([]);
        return;
      }

      const cacheKey = q.toLowerCase().trim();

      // Return cached
      if (_searchCache.has(cacheKey)) {
        setSuggestions(_searchCache.get(cacheKey)!);
        return;
      }

      // Cancel in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        let results: CatalogSuggestion[];

        if (apiAvailable) {
          results = await searchViaFastAPI(q, controller.signal);
        } else {
          results = await searchViaSupabase(q);
        }

        _searchCache.set(cacheKey, results);

        if (!controller.signal.aborted) {
          setSuggestions(results);
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;

        // FastAPI failed — fallback to Supabase
        if (apiAvailable) {
          setApiAvailable(false);
          try {
            const fallback = await searchViaSupabase(q);
            _searchCache.set(cacheKey, fallback);
            setSuggestions(fallback);
          } catch (fbErr: any) {
            setError('Search failed');
            setSuggestions([]);
          }
        } else {
          setError('Search failed');
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [apiAvailable]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || query.length < MIN_QUERY_LEN) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => search(query), DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // Clear cache when catalog might have changed
  const invalidateCache = useCallback(() => {
    _searchCache.clear();
  }, []);

  return { suggestions, loading, error, apiAvailable, invalidateCache };
}
