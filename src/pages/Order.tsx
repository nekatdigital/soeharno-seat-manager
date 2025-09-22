import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { QRService } from '@/services/qrService';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Plus, Minus, Fish, Utensils, Coffee } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
  image_url?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface QRTable {
  id: string;
  table_number: number;
  qr_enabled: boolean;
}

export default function Order() {
  const { tableId, secret } = useParams<{ tableId: string; secret: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [table, setTable] = useState<QRTable | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Customer form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (!tableId || !secret) {
      toast({
        title: 'Invalid QR Code',
        description: 'Link QR tidak valid',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }
    
    validateAndLoadData();
  }, [tableId, secret]);

  const validateAndLoadData = async () => {
    try {
      setLoading(true);
      
      // Validate QR access
      const tableData = await QRService.validateQRAccess(tableId!, secret!);
      if (!tableData) {
        toast({
          title: 'QR Code Invalid',
          description: 'QR code tidak valid atau sudah tidak aktif',
          variant: 'destructive'
        });
        navigate('/');
        return;
      }
      
      setTable(tableData);
      
      // Load menu items
      const { data: items, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });
        
      if (error) throw error;
      setMenuItems(items || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === item.id);
      if (existing) {
        return prev.map(p => 
          p.id === item.id 
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== itemId));
      return;
    }
    
    setCart(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'paket mancing':
      case 'umpan':
        return <Fish className="h-4 w-4" />;
      case 'makanan':
        return <Utensils className="h-4 w-4" />;
      case 'minuman':
        return <Coffee className="h-4 w-4" />;
      default:
        return <Utensils className="h-4 w-4" />;
    }
  };

  const submitOrder = async () => {
    if (!customerName.trim()) {
      toast({
        title: 'Nama Diperlukan',
        description: 'Silakan isi nama Anda',
        variant: 'destructive'
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: 'Keranjang Kosong',
        description: 'Pilih minimal satu item untuk dipesan',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('qr_orders')
        .insert({
          table_id: tableId,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim() || null,
          total_amount: getTotalAmount(),
          notes: notes.trim() || null,
          status: 'terkirim'
        })
        .select('id, order_number')
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        item_name: item.name,
        item_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('qr_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: 'Pesanan Berhasil!',
        description: `Pesanan ${order.order_number} telah dikirim`
      });

      // Redirect to order tracking
      navigate(`/track/${order.id}`);
      
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengirim pesanan. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat menu...</p>
        </div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p>QR Code tidak valid</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 px-4 max-w-4xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Fish className="h-6 w-6" />
              Sistem Pemancingan - Meja {table.table_number}
            </CardTitle>
            <p className="text-muted-foreground">
              Pilih menu dan pesan langsung tanpa antri ke kasir
            </p>
          </CardHeader>
        </Card>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Card className="mb-6 sticky top-4 z-10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="font-medium">{cart.length} item</span>
                  <Badge variant="secondary">
                    Rp {getTotalAmount().toLocaleString('id-ID')}
                  </Badge>
                </div>
                <Button 
                  onClick={() => setShowCheckout(!showCheckout)}
                  size="sm"
                >
                  {showCheckout ? 'Tutup' : 'Checkout'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checkout Form */}
        {showCheckout && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detail Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama *</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Masukkan nama Anda"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">No. HP (opsional)</Label>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan (opsional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan khusus untuk pesanan..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-lg font-bold">
                  Total: Rp {getTotalAmount().toLocaleString('id-ID')}
                </div>
                <Button 
                  onClick={submitOrder} 
                  disabled={submitting}
                  size="lg"
                >
                  {submitting ? 'Mengirim...' : 'Pesan Sekarang'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menu Categories */}
        {categories.map((category) => {
          const categoryItems = menuItems.filter(item => item.category === category);
          if (categoryItems.length === 0) return null;

          return (
            <Card key={category} className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                        <p className="font-bold text-primary mt-2">
                          Rp {item.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <Button
                        onClick={() => addToCart(item)}
                        className="ml-4"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Tambah
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {menuItems.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Menu belum tersedia</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}