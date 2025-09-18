import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { TakeawayForm } from "@/components/transactions/TakeawayForm";

export type PaymentMethod = 'cash' | 'qris' | 'transfer' | null;
export type TxStatus = 'pending' | 'paid';

export interface TxItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface TransactionRecord {
  id: string;
  kind: 'dine_in' | 'takeaway';
  tableNumber?: number;
  customerName: string;
  items: { menuItem: { id: string; name: string; price: number }; quantity: number }[];
  totalAmount: number;
  timestamp: string;
  status: TxStatus;
  paymentMethod: PaymentMethod;
}

interface TransactionsPageProps {
  transactions: TransactionRecord[];
  onUpdate: (tx: TransactionRecord) => void;
  onAdd: (tx: TransactionRecord) => void;
}

export const TransactionsPage = ({ transactions, onUpdate, onAdd }: TransactionsPageProps) => {
  const { toast } = useToast();
  const [openTakeaway, setOpenTakeaway] = useState(false);

  const totalPaid = useMemo(() => transactions.filter(t => t.status === 'paid').reduce((s, t) => s + t.totalAmount, 0), [transactions]);

  const setPayment = (t: TransactionRecord, method: PaymentMethod) => {
    onUpdate({ ...t, paymentMethod: method });
  };

  const setStatus = (t: TransactionRecord, status: TxStatus) => {
    onUpdate({ ...t, status });
    toast({ title: status === 'paid' ? 'Pesanan Lunas' : 'Menunggu Pembayaran' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-deep-water">Transaksi</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">Total Lunas: <span className="font-semibold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalPaid)}</span></div>
          <Button onClick={() => setOpenTakeaway(true)}>
            <PlusCircle className="w-4 h-4 mr-1" /> Transaksi Takeaway Baru
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {transactions.length === 0 && (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">Belum ada transaksi</CardContent>
          </Card>
        )}
        {transactions.map((t) => (
          <Card key={t.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t.kind === 'dine_in' ? `Dine-in ${t.tableNumber ? `(Meja ${t.tableNumber})` : ''}` : 'Takeaway'} - {t.customerName}</span>
                <Badge variant={t.status === 'paid' ? 'default' : 'secondary'}>
                  {t.status === 'paid' ? 'Lunas' : 'Menunggu' }
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">Waktu: {new Date(t.timestamp).toLocaleString('id-ID')}</div>
              <div className="border rounded p-3 text-sm">
                {t.items.map((it) => (
                  <div key={it.menuItem.id} className="flex justify-between py-1">
                    <span>{it.menuItem.name} x {it.quantity}</span>
                    <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(it.menuItem.price * it.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t pt-2 mt-2 font-semibold">
                  <span>Total</span>
                  <span className="text-ocean-teal">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(t.totalAmount)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Select value={t.paymentMethod || ''} onValueChange={(v) => setPayment(t, (v || null) as PaymentMethod)}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Metode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="qris">QRIS</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setStatus(t, 'paid')} disabled={!t.paymentMethod}>Tandai Lunas</Button>
                <Button variant="outline" onClick={() => setStatus(t, 'pending')}>Menunggu</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {openTakeaway && (
        <TakeawayForm 
          onClose={() => setOpenTakeaway(false)}
          onComplete={(tx) => {
            onAdd(tx);
            setOpenTakeaway(false);
          }}
        />
      )}
    </div>
  );
}
