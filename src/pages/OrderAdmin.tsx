import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, 
  Eye, 
  Clock, 
  Truck, 
  CheckCircle, 
  Fish,
  Phone,
  FileText,
  RefreshCw 
} from 'lucide-react';

interface QROrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string | null;
  status: 'terkirim' | 'terbaca' | 'diproses' | 'diantar' | 'selesai';
  total_amount: number;
  notes: string | null;
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
  terkirim: { label: 'Baru Masuk', color: 'bg-blue-500', textColor: 'text-blue-600', icon: Bell },
  terbaca: { label: 'Sudah Dibaca', color: 'bg-yellow-500', textColor: 'text-yellow-600', icon: Eye },
  diproses: { label: 'Sedang Diproses', color: 'bg-orange-500', textColor: 'text-orange-600', icon: Clock },
  diantar: { label: 'Sedang Diantar', color: 'bg-purple-500', textColor: 'text-purple-600', icon: Truck },
  selesai: { label: 'Selesai', color: 'bg-green-500', textColor: 'text-green-600', icon: CheckCircle }
};

const statusFlow: Array<keyof typeof statusConfig> = ['terkirim', 'terbaca', 'diproses', 'diantar', 'selesai'];

export default function OrderAdmin() {
  const [orders, setOrders] = useState<QROrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | keyof typeof statusConfig>('all');
  const [playSound, setPlaySound] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
    
    // Subscribe to real-time order updates
    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'qr_orders'
        },
        (payload) => {
          console.log('Order update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            // New order - play sound and show notification
            if (playSound) {
              playNotificationSound();
            }
            toast({
              title: '🔔 Pesanan Baru!',
              description: `Pesanan baru dari ${payload.new.customer_name}`,
              duration: 5000
            });
          }
          
          loadOrders(); // Reload all orders
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [playSound]);

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const loadOrders = async () => {
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat pesanan',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: keyof typeof statusConfig) => {
    try {
      const { error } = await supabase
        .from('qr_orders')
        .update({ 
          status: newStatus,
          status_updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Status pesanan diubah menjadi "${statusConfig[newStatus].label}"`
      });

      loadOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengubah status pesanan',
        variant: 'destructive'
      });
    }
  };

  const getNextStatus = (currentStatus: keyof typeof statusConfig): keyof typeof statusConfig | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const pendingOrdersCount = orders.filter(order => order.status !== 'selesai').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Fish className="h-8 w-8" />
              Admin Pesanan QR
            </h1>
            <p className="text-muted-foreground">
              Kelola pesanan yang masuk dari sistem QR code
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={pendingOrdersCount > 0 ? 'destructive' : 'secondary'}>
              {pendingOrdersCount} pesanan pending
            </Badge>
            <Button onClick={loadOrders} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              Semua ({orders.length})
            </Button>
            {statusFlow.map((status) => {
              const count = orders.filter(order => order.status === status).length;
              const config = statusConfig[status];
              const IconComponent = config.icon;
              
              return (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  onClick={() => setFilter(status)}
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <IconComponent className="h-3 w-3" />
                  {config.label} ({count})
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusInfo = statusConfig[order.status];
          const IconComponent = statusInfo.icon;
          const nextStatus = getNextStatus(order.status);

          return (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${statusInfo.color} flex items-center justify-center`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{order.order_number}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Meja {order.table.table_number} • {new Date(order.created_at).toLocaleTimeString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusInfo.textColor}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Customer:</span>
                    <span>{order.customer_name}</span>
                  </div>
                  {order.customer_phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{order.customer_phone}</span>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Items:</h4>
                  <div className="bg-muted/50 rounded-md p-3 space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.item_name}</span>
                        <span>Rp {item.subtotal.toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                    <div className="border-t pt-1 mt-2 flex justify-between font-medium">
                      <span>Total:</span>
                      <span>Rp {order.total_amount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <FileText className="h-3 w-3" />
                      Catatan:
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded p-2">
                      {order.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {nextStatus && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, nextStatus)}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {(() => {
                        const NextIcon = statusConfig[nextStatus].icon;
                        return <NextIcon className="h-3 w-3" />;
                      })()}
                      {statusConfig[nextStatus].label}
                    </Button>
                  )}
                  
                  {order.status !== 'selesai' && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'selesai')}
                      variant="outline"
                      size="sm"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Selesai
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Fish className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {filter === 'all' ? 'Belum ada pesanan' : `Tidak ada pesanan dengan status "${statusConfig[filter as keyof typeof statusConfig]?.label}"`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}