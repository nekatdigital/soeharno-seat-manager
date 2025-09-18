import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table as TTable } from "@/components/dashboard/TableMap";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Pencil, Plus } from "lucide-react";

interface TableManagerProps {
  tables: TTable[];
  onChange: (next: TTable[]) => void;
}

export const TableManager = ({ tables, onChange }: TableManagerProps) => {
  const { toast } = useToast();
  const [capacity, setCapacity] = useState<number>(4);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCapacity, setEditCapacity] = useState<number>(4);

  const nextNumber = useMemo(() => (tables.length ? Math.max(...tables.map(t => t.number)) + 1 : 1), [tables]);

  const addTable = () => {
    if (!capacity || capacity <= 0) {
      toast({ title: "Kapasitas tidak valid", variant: "destructive" });
      return;
    }
    const newTable: TTable = {
      id: String(Date.now()),
      number: nextNumber,
      capacity,
      status: 'empty',
    };
    onChange([...tables, newTable]);
    toast({ title: `Meja ${newTable.number} ditambahkan` });
  };

  const startEdit = (t: TTable) => {
    setEditingId(t.id);
    setEditCapacity(t.capacity);
  };

  const saveEdit = (id: string) => {
    if (!editCapacity || editCapacity <= 0) {
      toast({ title: "Kapasitas tidak valid", variant: "destructive" });
      return;
    }
    onChange(tables.map(t => (t.id === id ? { ...t, capacity: editCapacity } : t)));
    setEditingId(null);
    toast({ title: "Perubahan disimpan" });
  };

  const remove = (id: string) => {
    const t = tables.find(x => x.id === id);
    onChange(tables.filter(t => t.id !== id));
    toast({ title: `Meja ${t?.number} dihapus` });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kelola Meja</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-3">
          <div>
            <Label>Nomor Meja (auto)</Label>
            <Input value={nextNumber} readOnly className="font-mono" />
          </div>
          <div>
            <Label>Kapasitas</Label>
            <Input type="number" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value || '0', 10))} />
          </div>
          <Button onClick={addTable} className="mt-2"><Plus className="w-4 h-4 mr-1" />Tambah</Button>
        </div>

        <div className="border rounded-md divide-y">
          {tables.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">Belum ada meja</div>
          )}
          {tables.map((t) => (
            <div key={t.id} className="p-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-20 font-medium">Meja {t.number}</div>
                {editingId === t.id ? (
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Kapasitas</Label>
                    <Input type="number" className="w-24" value={editCapacity} onChange={(e) => setEditCapacity(parseInt(e.target.value || '0', 10))} />
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Kapasitas {t.capacity}</div>
                )}
                <div className="text-xs rounded px-2 py-1 border">Status: {t.status}</div>
              </div>
              <div className="flex gap-2">
                {editingId === t.id ? (
                  <Button size="sm" onClick={() => saveEdit(t.id)}>Simpan</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => startEdit(t)}><Pencil className="w-4 h-4" /></Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => remove(t.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
