import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem, MenuCategory } from "@/lib/menu/types";
import { demoMenu } from "@/lib/menu/demo";
import { getMenuItems, setMenuItems } from "@/lib/menu/storage";
import { Pencil, Trash2, Save, Plus } from "lucide-react";

export const MenuManager = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState<MenuCategory>("makanan");
  const [active, setActive] = useState(true);

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCategory, setEditCategory] = useState<MenuCategory>("makanan");
  const [editActive, setEditActive] = useState(true);

  useEffect(() => {
    (async () => {
      const loaded = await getMenuItems();
      if (loaded.length === 0) {
        setItems(demoMenu);
      } else {
        setItems(loaded);
      }
    })();
  }, []);

  useEffect(() => {
    setMenuItems(items).catch(() => void 0);
  }, [items]);

  const add = () => {
    if (!name.trim() || price <= 0) {
      toast({ title: "Nama dan harga wajib diisi", variant: "destructive" });
      return;
    }
    const newItem: MenuItem = { id: crypto.randomUUID(), name, price, category, is_active: active };
    setItems(prev => [...prev, newItem]);
    setName(""); setPrice(0); setCategory("makanan"); setActive(true);
    toast({ title: "Menu ditambahkan" });
  };

  const startEdit = (it: MenuItem) => {
    setEditId(it.id);
    setEditName(it.name);
    setEditPrice(it.price);
    setEditCategory(it.category);
    setEditActive(it.is_active !== false);
  };

  const saveEdit = () => {
    if (!editId) return;
    if (!editName.trim() || editPrice <= 0) {
      toast({ title: "Nama dan harga wajib diisi", variant: "destructive" });
      return;
    }
    setItems(prev => prev.map(i => i.id === editId ? { ...i, name: editName, price: editPrice, category: editCategory, is_active: editActive } : i));
    setEditId(null);
    toast({ title: "Perubahan disimpan" });
  };

  const remove = (id: string) => {
    const it = items.find(x => x.id === id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast({ title: `Hapus ${it?.name}` });
  };

  const seedDemo = () => {
    setItems(demoMenu);
    toast({ title: "Contoh menu dimuat" });
  };

  const categories: MenuCategory[] = ["makanan", "minuman", "paket_mancing"];
  const sorted = useMemo(() => items.slice().sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)), [items]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Menu</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <Label>Nama</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama menu" />
          </div>
          <div>
            <Label>Harga</Label>
            <Input type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value || '0', 10))} />
          </div>
          <div>
            <Label>Kategori</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as MenuCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (<SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex items-center gap-2">
              <Switch checked={active} onCheckedChange={setActive} />
              <span className="text-sm">Aktif</span>
            </div>
            <Button onClick={add} className="ml-auto"><Plus className="w-4 h-4 mr-1" />Tambah</Button>
            <Button variant="outline" onClick={seedDemo}>Muat Contoh</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Menu</CardTitle>
        </CardHeader>
        <CardContent className="divide-y border rounded-md">
          {sorted.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">Belum ada menu</div>
          )}
          {sorted.map((it) => (
            <div key={it.id} className="p-3 flex items-center gap-3 justify-between">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                {editId === it.id ? (
                  <>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <Input type="number" value={editPrice} onChange={(e) => setEditPrice(parseInt(e.target.value || '0', 10))} />
                    <Select value={editCategory} onValueChange={(v) => setEditCategory(v as MenuCategory)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (<SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Switch checked={editActive} onCheckedChange={setEditActive} />
                      <span className="text-sm">Aktif</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{it.category.replace('_', ' ')}</div>
                    </div>
                    <div className="text-sm">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(it.price)}</div>
                    <div className={`text-xs rounded px-2 py-0.5 border ${it.is_active === false ? 'bg-red-50' : 'bg-green-50'}`}>{it.is_active === false ? 'Nonaktif' : 'Aktif'}</div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {editId === it.id ? (
                  <Button size="sm" onClick={saveEdit}><Save className="w-4 h-4" /></Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => startEdit(it)}><Pencil className="w-4 h-4" /></Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => remove(it.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
