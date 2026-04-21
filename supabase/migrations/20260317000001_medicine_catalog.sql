-- Medicine Catalog Migration
-- Master drug reference database for 50,000+ Indian medicines
-- Separate from 'medicines' inventory table

-- Enable pg_trgm for fast partial text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── medicine_catalog table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medicine_catalog (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_name     text          NOT NULL,
  manufacturer  text          NOT NULL DEFAULT '',
  composition   text          NOT NULL DEFAULT '',
  pack_size     text          NOT NULL DEFAULT '',
  mrp           decimal(10,2) NOT NULL DEFAULT 0.00,
  category      text          NOT NULL DEFAULT 'Regular',
  created_at    timestamptz   DEFAULT now(),

  -- Uniqueness on drug_name so bulk inserts can ON CONFLICT DO NOTHING
  CONSTRAINT uq_medicine_catalog_drug_name UNIQUE (drug_name)
);

-- ── Indexes ───────────────────────────────────────────────────────
-- GIN trigram index for fast ILIKE / similarity search on drug_name
CREATE INDEX IF NOT EXISTS idx_mc_drug_name_trgm
  ON medicine_catalog USING GIN (drug_name gin_trgm_ops);

-- GIN trigram index on manufacturer for manufacturer search
CREATE INDEX IF NOT EXISTS idx_mc_manufacturer_trgm
  ON medicine_catalog USING GIN (manufacturer gin_trgm_ops);

-- Standard B-tree for exact match lookups
CREATE INDEX IF NOT EXISTS idx_mc_drug_name_btree
  ON medicine_catalog (drug_name);

CREATE INDEX IF NOT EXISTS idx_mc_manufacturer_btree
  ON medicine_catalog (manufacturer);

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE medicine_catalog ENABLE ROW LEVEL SECURITY;

-- Public read (catalog is reference data, not sensitive)
CREATE POLICY "Anyone can read medicine_catalog"
  ON medicine_catalog FOR SELECT
  TO public
  USING (true);

-- Public insert (for seed scripts and data imports)
CREATE POLICY "Anyone can insert medicine_catalog"
  ON medicine_catalog FOR INSERT
  TO public
  WITH CHECK (true);

-- Public update
CREATE POLICY "Anyone can update medicine_catalog"
  ON medicine_catalog FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- ── Full-text search function ─────────────────────────────────────
-- Efficient search function used by FastAPI and direct Supabase calls
CREATE OR REPLACE FUNCTION search_medicines(query text, result_limit int DEFAULT 10)
RETURNS TABLE (
  id            uuid,
  drug_name     text,
  manufacturer  text,
  composition   text,
  pack_size     text,
  mrp           decimal,
  category      text
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id, drug_name, manufacturer, composition, pack_size, mrp, category
  FROM medicine_catalog
  WHERE
    drug_name ILIKE '%' || query || '%'
    OR manufacturer ILIKE '%' || query || '%'
  ORDER BY
    -- Exact prefix match comes first
    CASE WHEN drug_name ILIKE query || '%' THEN 0 ELSE 1 END,
    drug_name
  LIMIT result_limit;
$$;
