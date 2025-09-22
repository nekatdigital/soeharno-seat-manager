import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Clock, Eye, Truck, Fish } from 'lucide-react';

interface OrderDetails {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  status: 'terkirim' | 'terbaca' | 'diproses' | 'diantar' | 'selesai';
  total_amount: number;
  notes: string;
  created_at: string;
  updated_at: string;
  status_updated_at: string;
  table: {
    table_number: number;
  };
  items: Array<{
    id: string;
    item_name: string;
    item_price: number;
    quantity: number;
    subtotal: number;
  }>;
}

const statusConfig = {
  terkirim: {
    label: 'Pesanan Terkirim',
    description: 'Pesanan Anda telah diterima sistem',
    icon: CheckCircle,
    color: 'bg-blue-500'
  },
  terbaca: {
    label: 'Pesanan Terbaca',
    description: 'Staff telah melihat pesanan Anda',
    icon: Eye,
    color: 'bg-yellow-500'
  },
  diproses: {
    label: 'Sedang Diproses',
    description: 'Pesanan sedang disiapkan',
    icon: Clock,
    color: 'bg-orange-500'
  },
  diantar: {
    label: 'Sedang Diantar',
    description: 'Pesanan sedang diantar ke meja Anda',
    icon: Truck,
    color: 'bg-purple-500'
  },
  selesai: {
    label: 'Pesanan Selesai',
    description: 'Pesanan telah sampai di meja Anda',
    icon: CheckCircle,
    color: 'bg-green-500'
  }
};

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    
    loadOrderDetails();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'qr_orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log('Order status updated:', payload);
          loadOrderDetails(); // Reload order details when status changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('qr_orders')
        .select(`
          *,
          table:restaurant_tables(table_number),
          items:qr_order_items(
            id,
            item_name,
            item_price,
            quantity,
            subtotal
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      
      setOrder(data);
      setError(null);
    } catch (err) {
      console.error('Error loading order:', err);
      setError('Pesanan tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat status pesanan...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-destructive">{error || 'Pesanan tidak ditemukan'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStatusIndex = Object.keys(statusConfig).indexOf(order.status);
  const statuses = Object.keys(statusConfig) as Array<keyof typeof statusConfig>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 px-4 max-w-2xl">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Fish className="h-6 w-6" />
              Tracking Pesanan
            </CardTitle>
            <div className="space-y-2">
              <p className="text-lg font-semibold">{order.order_number}</p>
              <p className="text-muted-foreground">
                Meja {order.table.table_number} • {order.customer_name}
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Current Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Status Saat Ini</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className={`w-16 h-16 rounded-full ${statusConfig[order.status].color} flex items-center justify-center`}>
                {(() => {
                  const IconComponent = statusConfig[order.status].icon;
                  return <IconComponent className="h-8 w-8 text-white" />;
                })()}
              </div>
              <div>
                <h3 className="text-xl font-bold">{statusConfig[order.status].label}</h3>
                <p className="text-muted-foreground">{statusConfig[order.status].description}</p>
              </div>
              <Badge variant="secondary">
                Update terakhir: {new Date(order.status_updated_at).toLocaleTimeString('id-ID')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Progress Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Progress Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statuses.map((statusKey, index) => {
                const status = statusConfig[statusKey];
                const IconComponent = status.icon;
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                
                return (
                  <div key={statusKey} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted 
                        ? status.color 
                        : 'bg-muted'
                    }`}>
                      <IconComponent className={`h-4 w-4 ${
                        isCompleted ? 'text-white' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        isCurrent ? 'text-primary' : 
                        isCompleted ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {status.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {status.description}
                      </p>
                    </div>
                    {isCurrent && (
                      <Badge variant="default">Saat ini</Badge>
                    )}
                    {isCompleted && !isCurrent && (
                      <Badge variant="secondary">✓</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detail Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{item.item_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} x Rp {item.item_price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <p className="font-semibold">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
              
              {order.notes && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-1">Catatan:</p>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>Rp {order.total_amount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Waktu Pesan:</strong> {new Date(order.created_at).toLocaleString('id-ID')}</p>
            {order.customer_phone && (
              <p><strong>No. HP:</strong> {order.customer_phone}</p>
            )}
            <p className="text-muted-foreground mt-4">
              Halaman ini akan update otomatis ketika status pesanan berubah. 
              Anda tidak perlu refresh halaman.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}