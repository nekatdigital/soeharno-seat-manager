-- Enable realtime for QR orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_order_items;