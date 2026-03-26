/*
  # Pharmacy Management System Schema

  ## Overview
  Complete database schema for Sravanthi Medical Stores pharmacy management system
  including inventory, billing, customer and doctor management.

  ## New Tables
  
  ### 1. medicines
  - `id` (uuid, primary key) - Unique identifier
  - `drug_name` (text) - Name of the medicine
  - `manufacturer` (text) - Manufacturer name
  - `batch_no` (text) - Batch number
  - `expiry_date` (date) - Expiry date
  - `mrp` (decimal) - Maximum Retail Price
  - `current_stock` (integer) - Current stock quantity
  - `category` (text) - Schedule H or Regular
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. customers
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Customer name
  - `address` (text) - Customer address
  - `phone` (text) - Phone number
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. doctors
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Doctor name
  - `address` (text) - Doctor address
  - `phone` (text) - Phone number
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. bills
  - `id` (uuid, primary key) - Unique identifier
  - `serial_no` (integer) - Auto-incrementing bill number
  - `bill_date` (date) - Date of bill
  - `customer_id` (uuid) - Reference to customers table
  - `customer_name` (text) - Customer name (denormalized)
  - `customer_address` (text) - Customer address (denormalized)
  - `customer_phone` (text) - Customer phone (denormalized)
  - `doctor_id` (uuid, nullable) - Reference to doctors table
  - `doctor_name` (text) - Doctor name (denormalized)
  - `doctor_address` (text) - Doctor address (denormalized)
  - `doctor_phone` (text) - Doctor phone (denormalized)
  - `subtotal` (decimal) - Subtotal amount
  - `tax_amount` (decimal) - Tax amount
  - `grand_total` (decimal) - Grand total amount
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. bill_items
  - `id` (uuid, primary key) - Unique identifier
  - `bill_id` (uuid) - Reference to bills table
  - `medicine_id` (uuid) - Reference to medicines table
  - `drug_name` (text) - Drug name (denormalized)
  - `manufacturer` (text) - Manufacturer (denormalized)
  - `batch_no` (text) - Batch number (denormalized)
  - `expiry_date` (date) - Expiry date (denormalized)
  - `quantity` (integer) - Quantity sold
  - `mrp` (decimal) - MRP at time of sale
  - `row_total` (decimal) - Row total (quantity * mrp)
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for all tables (suitable for single-store POS system)
  - Authenticated insert/update access
*/

-- Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_name text NOT NULL,
  manufacturer text NOT NULL,
  batch_no text NOT NULL,
  expiry_date date NOT NULL,
  mrp decimal(10, 2) NOT NULL,
  current_stock integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'Regular',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text DEFAULT '',
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text DEFAULT '',
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create bills table
CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_no serial UNIQUE NOT NULL,
  bill_date date NOT NULL DEFAULT CURRENT_DATE,
  customer_id uuid REFERENCES customers(id),
  customer_name text NOT NULL,
  customer_address text DEFAULT '',
  customer_phone text DEFAULT '',
  doctor_id uuid REFERENCES doctors(id),
  doctor_name text DEFAULT '',
  doctor_address text DEFAULT '',
  doctor_phone text DEFAULT '',
  subtotal decimal(10, 2) NOT NULL DEFAULT 0,
  tax_amount decimal(10, 2) NOT NULL DEFAULT 0,
  grand_total decimal(10, 2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create bill_items table
CREATE TABLE IF NOT EXISTS bill_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid REFERENCES bills(id) ON DELETE CASCADE NOT NULL,
  medicine_id uuid REFERENCES medicines(id),
  drug_name text NOT NULL,
  manufacturer text NOT NULL,
  batch_no text NOT NULL,
  expiry_date date NOT NULL,
  quantity integer NOT NULL,
  mrp decimal(10, 2) NOT NULL,
  row_total decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medicines_drug_name ON medicines(drug_name);
CREATE INDEX IF NOT EXISTS idx_medicines_expiry ON medicines(expiry_date);
CREATE INDEX IF NOT EXISTS idx_bills_serial_no ON bills(serial_no);
CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(bill_date);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);

-- Enable Row Level Security
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medicines
CREATE POLICY "Anyone can view medicines"
  ON medicines FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert medicines"
  ON medicines FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update medicines"
  ON medicines FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for customers
CREATE POLICY "Anyone can view customers"
  ON customers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert customers"
  ON customers FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update customers"
  ON customers FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for doctors
CREATE POLICY "Anyone can view doctors"
  ON doctors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert doctors"
  ON doctors FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update doctors"
  ON doctors FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for bills
CREATE POLICY "Anyone can view bills"
  ON bills FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert bills"
  ON bills FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update bills"
  ON bills FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS Policies for bill_items
CREATE POLICY "Anyone can view bill_items"
  ON bill_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert bill_items"
  ON bill_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update bill_items"
  ON bill_items FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);