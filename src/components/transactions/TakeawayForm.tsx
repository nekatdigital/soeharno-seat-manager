import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, Receipt, X } from "lucide-react";
import type { TransactionRecord } from "@/components/transactions/TransactionsPage";

import type { MenuItem } from "@/lib/menu/types";
import { getMenuItems } from "@/lib/menu/storage";
import { demoMenu } from "@/lib/menu/demo";

interface OrderItem { menuItem: MenuItem; quantity: number; }

export const TakeawayForm = ({ onClose, onComplete }: { onClose: () => void; onComplete: (tx: TransactionRecord) => void; }) => {
  const [customerName, setCustomerName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>(demoMenu);
  const { toast } = useToast();

  const filteredMenu = selectedCategory === "all" ? menu.filter(i => i.is_active !== false) : menu.filter(item => item.category === selectedCategory && item.is_active !== false);

  const addToOrder = (menuItem: MenuItem) => {
    const existingItem = orderItems.find(item => item.menuItem.id === menuItem.id);
    if (existingItem) {
      setOrderItems(prev => prev.map(item => item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setOrderItems(prev => [...prev, { menuItem, quantity: 1 }]);
    }
  };

  const updateQuantity = (menuItemId: string, change: number) => {
    setOrderItems(prev => prev.map(item => {
      if (item.menuItem.id === menuItemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromOrder = (menuItemId: string) => setOrderItems(prev => prev.filter(item => item.menuItem.id !== menuItemId));

  const totalAmount = orderItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const handleSubmit = () => {
    if (!customerName.trim()) {
      toast({ title: "Error", description: "Nama pelanggan harus diisi", variant: "destructive" });
      return;
    }
    if (orderItems.length === 0) {
      toast({ title: "Error", description: "Minimal harus ada 1 item pesanan", variant: "destructive" });
      return;
    }

    const tx: TransactionRecord = {
      id: Date.now().toString(),
      kind: 'takeaway',
      customerName,
      items: orderItems,
      totalAmount,
      timestamp: new Date().toISOString(),
      status: 'pending',
      paymentMethod: null,
    };
    onComplete(tx);
    toast({ title: "Transaksi takeaway dibuat", description: `Pesanan untuk ${customerName}` });
  };

  // load managed menu
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useState(() => {
    (async () => {
      const items = await getMenuItems();
      if (items && items.length) setMenu(items);
    })();
    return undefined;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-strong">
        <CardHeader className="bg-gradient-to-r from-ocean-teal to-deep-water text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">Transaksi Takeaway</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer">Nama Pelanggan</Label>
                <Input id="customer" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Masukkan nama pelanggan" className="mt-1" />
              </div>
              <div>
                <Label>Kategori Menu</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    <SelectItem value="makanan">Makanan</SelectItem>
                    <SelectItem value="minuman">Minuman</SelectItem>
                    <SelectItem value="paket_mancing">Paket Mancing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Daftar Menu</Label>
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {filteredMenu.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-warm-sand/30 transition-colors">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{formatCurrency(item.price)}</div>
                      </div>
                      <Button size="sm" onClick={() => addToOrder(item)} className="bg-ocean-teal hover:bg-deep-water">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Pesanan</Label>
                <Badge variant="secondary">{orderItems.length} item</Badge>
              </div>
              <div className="border rounded-lg p-4 space-y-3 max-h-80 overflow-y-auto">
                {orderItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Belum ada pesanan</p>
                ) : (
                  orderItems.map((item) => (
                    <div key={item.menuItem.id} className="flex items-center justify-between p-2 bg-warm-sand/20 rounded">
                      <div className="flex-1">
                        <div className="font-medium">{item.menuItem.name}</div>
                        <div className="text-sm text-muted-foreground">{formatCurrency(item.menuItem.price)} x {item.quantity}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.menuItem.id, -1)}><Minus className="w-3 h-3" /></Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.menuItem.id, 1)}><Plus className="w-3 h-3" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => removeFromOrder(item.menuItem.id)}><X className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {orderItems.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-ocean-teal">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              )}
              <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-ocean-teal to-deep-water hover:from-deep-water hover:to-ocean-teal h-12" disabled={!customerName.trim() || orderItems.length === 0}>
                <Receipt className="w-4 h-4 mr-2" /> Buat Transaksi
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
