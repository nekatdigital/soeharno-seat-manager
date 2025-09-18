import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { AppUser, UserRole } from "@/lib/users/types";
import { createUser, deleteUser, ensureSeedUsers, getUsers, updateUser } from "@/lib/users/storage";
import { Pencil, Save, Trash2 } from "lucide-react";

export const UserManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<AppUser[]>([]);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>('staff');

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<UserRole>('staff');

  useEffect(() => {
    (async () => {
      await ensureSeedUsers();
      setUsers(await getUsers());
    })();
  }, []);

  const add = async () => {
    try {
      if (!name.trim() || !username.trim() || !password.trim()) {
        toast({ title: 'Semua field wajib diisi', variant: 'destructive' });
        return;
      }
      const u = await createUser(name, username, password, role);
      setUsers(prev => [...prev, u]);
      setName(''); setUsername(''); setPassword(''); setRole('staff');
      toast({ title: 'User ditambahkan' });
    } catch (e: any) {
      toast({ title: 'Gagal', description: e.message, variant: 'destructive' });
    }
  };

  const startEdit = (u: AppUser) => {
    setEditId(u.id);
    setEditName(u.name);
    setEditUsername(u.username);
    setEditPassword('');
    setEditRole(u.role);
  };

  const saveEdit = async () => {
    if (!editId) return;
    try {
      const u = users.find(x => x.id === editId)!;
      const updated = await updateUser(u, { name: editName, username: editUsername, password: editPassword || undefined, role: editRole });
      setUsers(prev => prev.map(x => x.id === updated.id ? updated : x));
      setEditId(null);
      toast({ title: 'Perubahan disimpan' });
    } catch (e: any) {
      toast({ title: 'Gagal', description: e.message, variant: 'destructive' });
    }
  };

  const remove = async (id: string) => {
    await deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
    toast({ title: 'User dihapus' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tambah User</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <Label>Nama</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" />
          </div>
          <div>
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={add}>Tambah</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar User</CardTitle>
        </CardHeader>
        <CardContent className="divide-y border rounded-md">
          {users.length === 0 && (<div className="p-4 text-sm text-muted-foreground">Belum ada user</div>)}
          {users.map(u => (
            <div key={u.id} className="p-3 grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
              {editId === u.id ? (
                <>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <Input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} />
                  <Input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Ganti password (opsional)" />
                  <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit}><Save className="w-4 h-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(u.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.username}</div>
                  </div>
                  <div className="text-sm capitalize">{u.role}</div>
                  <div className="text-xs text-muted-foreground">Dibuat: {new Date(u.createdAt).toLocaleString('id-ID')}</div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(u)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(u.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
