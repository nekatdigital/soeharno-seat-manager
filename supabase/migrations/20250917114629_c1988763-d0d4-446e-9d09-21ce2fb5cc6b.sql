-- Create restaurant management system tables

-- Users table for authentication and roles
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Restaurant tables management
CREATE TABLE public.restaurant_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number INTEGER UNIQUE NOT NULL,
  capacity INTEGER DEFAULT 4 CHECK (capacity > 0),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  customer_name VARCHAR(100),
  occupied_since TIMESTAMP WITH TIME ZONE,
  reservation_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Menu items
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category VARCHAR(50) DEFAULT 'food' CHECK (category IN ('food', 'drink', 'dessert', 'appetizer')),
  is_available BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Transactions/Orders
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id UUID REFERENCES public.restaurant_tables(id),
  customer_name VARCHAR(100),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id)
);

-- Transaction items (order details)
CREATE TABLE public.transaction_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- RLS Policies for restaurant_tables (accessible to authenticated users)
CREATE POLICY "Authenticated users can view tables" 
ON public.restaurant_tables 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can update tables" 
ON public.restaurant_tables 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert tables" 
ON public.restaurant_tables 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- RLS Policies for menu_items (publicly viewable, authenticated can modify)
CREATE POLICY "Anyone can view available menu items" 
ON public.menu_items 
FOR SELECT 
USING (is_available = true);

CREATE POLICY "Authenticated users can manage menu items" 
ON public.menu_items 
FOR ALL 
TO authenticated 
USING (true);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON public.transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for transaction_items
CREATE POLICY "Users can view transaction items" 
ON public.transaction_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.transactions 
  WHERE transactions.id = transaction_items.transaction_id 
  AND transactions.user_id = auth.uid()
));

CREATE POLICY "Users can insert transaction items" 
ON public.transaction_items 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.transactions 
  WHERE transactions.id = transaction_items.transaction_id 
  AND transactions.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_restaurant_tables_updated_at
    BEFORE UPDATE ON public.restaurant_tables
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON public.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.menu_items (name, description, price, category) VALUES
('Nasi Goreng', 'Indonesian fried rice with chicken and vegetables', 25000, 'food'),
('Mie Ayam', 'Chicken noodles with meatballs', 20000, 'food'),
('Teh Manis', 'Sweet iced tea', 5000, 'drink'),
('Kopi Hitam', 'Black coffee', 8000, 'drink'),
('Es Campur', 'Mixed ice dessert', 15000, 'dessert');

INSERT INTO public.restaurant_tables (table_number, capacity, status) VALUES
(1, 4, 'available'),
(2, 2, 'available'),
(3, 6, 'available'),
(4, 4, 'occupied'),
(5, 8, 'available');