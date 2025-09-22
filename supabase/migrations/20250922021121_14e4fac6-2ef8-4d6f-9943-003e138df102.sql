-- FASE 1: Database Schema Enhancement for QR Fishing System

-- Add QR code fields to restaurant_tables
ALTER TABLE restaurant_tables 
ADD COLUMN IF NOT EXISTS qr_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS qr_secret TEXT NOT NULL DEFAULT gen_random_uuid()::text,
ADD COLUMN IF NOT EXISTS qr_enabled BOOLEAN NOT NULL DEFAULT true;

-- Create order status enum (with proper check for existence)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM (
          'terkirim',    -- Order sent/submitted
          'terbaca',     -- Order read by staff
          'diproses',    -- Order being processed
          'diantar',     -- Order being delivered
          'selesai'      -- Order completed
        );
    END IF;
END $$;

-- Create qr_orders table for tracking QR-based orders
CREATE TABLE IF NOT EXISTS qr_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES restaurant_tables(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL UNIQUE DEFAULT 'ORD-' || EXTRACT(epoch FROM now())::text,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  status order_status NOT NULL DEFAULT 'terkirim',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create qr_order_items table for order line items
CREATE TABLE IF NOT EXISTS qr_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES qr_orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL, -- Store name for historical records
  item_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE qr_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for qr_orders (public can create, authenticated users can manage)
CREATE POLICY "Anyone can create QR orders" 
ON qr_orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view QR orders for status tracking" 
ON qr_orders 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can update QR orders" 
ON qr_orders 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for qr_order_items  
CREATE POLICY "Anyone can create QR order items" 
ON qr_order_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view QR order items" 
ON qr_order_items 
FOR SELECT 
USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_qr_orders_table_id ON qr_orders(table_id);
CREATE INDEX IF NOT EXISTS idx_qr_orders_status ON qr_orders(status);
CREATE INDEX IF NOT EXISTS idx_qr_orders_created_at ON qr_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_qr_order_items_order_id ON qr_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_qr_code ON restaurant_tables(qr_code);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_qr_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_qr_orders_updated_at_trigger
  BEFORE UPDATE ON qr_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_qr_orders_updated_at();

-- Generate QR codes for existing tables (if any)
UPDATE restaurant_tables 
SET qr_code = 'table-' || table_number || '-' || substring(gen_random_uuid()::text, 1, 8)
WHERE qr_code IS NULL;