import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Table, TableStatus } from "@/components/dashboard/TableMap";
import { useToast } from "@/hooks/use-toast";

function fmtDDMMYYYY(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

interface TableActionsProps {
  table: Table | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (t: Table) => void;
  onStartTransaction: (t: Table) => void;
  onEmpty: (t: Table) => void;
}

export const TableActions = ({ table, open, onOpenChange, onUpdate, onStartTransaction, onEmpty }: TableActionsProps) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'idle' | 'reserve' | 'editReserve'>('idle');
  const [name, setName] = useState('');
  const [people, setPeople] = useState<number>(1);
  const [date, setDate] = useState<string>(fmtDDMMYYYY(new Date()));
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    setMode('idle');
    if (table?.status === 'reserved') {
      setName(table.customerName || '');
      setPeople(table.reservationPeople || 1);
      setDate(table.reservationDate || fmtDDMMYYYY(new Date()));
      setTime(table.reservationTime || '');
    } else {
      setName('');
      setPeople(1);
      setDate(fmtDDMMYYYY(new Date()));
      setTime('');
    }
  }, [open, table]);

  const canReserve = useMemo(() => name.trim().length > 0 && people > 0 && date.trim().length > 0 && time.trim().length > 0, [name, people, date, time]);

  if (!table) return null;

  const setStatus = (status: TableStatus) => {
    onUpdate({ ...table, status });
    toast({ title: `Status diubah ke ${status}` });
  };

  const saveReservation = () => {
    if (!canReserve) {
      toast({ title: 'Lengkapi data reservasi', variant: 'destructive' });
      return;
    }
    const updated: Table = {
      ...table,
      status: 'reserved',
      customerName: name,
      reservationPeople: people,
      reservationDate: date,
      reservationTime: `${time}`,
    };
    onUpdate(updated);
    onOpenChange(false);
    toast({ title: 'Reservasi disimpan' });
  };

  const cancelReservation = () => {
    const updated: Table = { ...table };
    delete updated.customerName;
    delete updated.reservationDate;
    delete updated.reservationTime;
    delete updated.reservationPeople;
    updated.status = 'empty';
    onUpdate(updated);
    toast({ title: 'Reservasi dibatalkan' });
  };

  const startTx = () => {
    onStartTransaction(table);
    onOpenChange(false);
  };

  const finishAndEmpty = () => {
    const updated: Table = { ...table };
    delete updated.customerName;
    delete updated.occupiedSince;
    onEmpty(updated);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aksi - Meja {table.number}</DialogTitle>
        </DialogHeader>

        {table.status === 'empty' && mode === 'idle' && (
          <div className="space-y-3">
            <Button className="w-full" onClick={() => setMode('reserve')}>Reservasi</Button>
            <Button className="w-full" variant="secondary" onClick={startTx}>Mulai Transaksi</Button>
          </div>
        )}

        {table.status === 'reserved' && mode === 'idle' && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Reservasi atas nama <span className="font-medium">{table.customerName}</span> pada {table.reservationDate} {table.reservationTime} untuk {table.reservationPeople} orang.
            </div>
            <Button className="w-full" onClick={startTx}>Mulai Transaksi</Button>
            <div className="flex gap-2">
              <Button className="flex-1" variant="outline" onClick={() => setMode('editReserve')}>Ubah Reservasi</Button>
              <Button className="flex-1" variant="destructive" onClick={cancelReservation}>Batalkan Reservasi</Button>
            </div>
          </div>
        )}

        {table.status === 'occupied' && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Meja sedang terisi oleh {table.customerName || '...'}</div>
            <Button className="w-full" variant="destructive" onClick={finishAndEmpty}>Selesaikan & Kosongkan</Button>
          </div>
        )}

        {(mode === 'reserve' || mode === 'editReserve') && (
          <div className="space-y-3">
            <div>
              <Label>Nama</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama yang reservasi" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tanggal (DD/MM/YYYY)</Label>
                <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="DD/MM/YYYY" />
              </div>
              <div>
                <Label>Jam (HH:mm)</Label>
                <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="HH:mm" />
              </div>
            </div>
            <div>
              <Label>Jumlah Orang</Label>
              <Input type="number" value={people} onChange={(e) => setPeople(parseInt(e.target.value || '0', 10))} />
            </div>
          </div>
        )}

        <DialogFooter>
          <div className="flex gap-2 w-full justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
            {(mode === 'reserve' || mode === 'editReserve') && (
              <Button onClick={saveReservation} disabled={!canReserve}>Simpan Reservasi</Button>
            )}
            {table.status !== 'occupied' && table.status !== 'reserved' && mode === 'idle' && (
              <Button variant="outline" onClick={() => setStatus('empty')}>Set Kosong</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
