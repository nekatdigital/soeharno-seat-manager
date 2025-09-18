import { SimpleDB } from "@/lib/storage/simpledb";
import type { AppUser, UserRole } from "@/lib/users/types";
import { sha256Hex } from "@/lib/users/crypto";

const KEY = "users";

export async function getUsers(): Promise<AppUser[]> {
  const db = new SimpleDB("appDB", 1);
  const users = await db.get<AppUser[]>(KEY);
  return Array.isArray(users) ? users : [];
}

export async function setUsers(users: AppUser[]): Promise<void> {
  const db = new SimpleDB("appDB", 1);
  await db.set(KEY, users);
}

export async function ensureSeedUsers(): Promise<void> {
  const existing = await getUsers();
  if (existing.length === 0) {
    const now = new Date().toISOString();
    const seed: AppUser[] = [
      { id: crypto.randomUUID(), name: 'Owner', username: 'owner', passwordHash: await sha256Hex('admin123'), role: 'owner', createdAt: now },
      { id: crypto.randomUUID(), name: 'Staff', username: 'staff', passwordHash: await sha256Hex('staff123'), role: 'staff', createdAt: now },
    ];
    await setUsers(seed);
  }
}

export async function createUser(name: string, username: string, password: string, role: UserRole): Promise<AppUser> {
  const users = await getUsers();
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Username sudah digunakan');
  }
  const user: AppUser = {
    id: crypto.randomUUID(),
    name,
    username,
    passwordHash: await sha256Hex(password),
    role,
    createdAt: new Date().toISOString(),
  };
  await setUsers([...users, user]);
  return user;
}

export async function updateUser(user: AppUser, opts: { name?: string; username?: string; password?: string; role?: UserRole }): Promise<AppUser> {
  const users = await getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx === -1) throw new Error('User tidak ditemukan');
  if (opts.username && users.some(u => u.username.toLowerCase() === opts.username!.toLowerCase() && u.id !== user.id)) {
    throw new Error('Username sudah digunakan');
  }
  const updated: AppUser = {
    ...user,
    name: opts.name ?? user.name,
    username: opts.username ?? user.username,
    role: opts.role ?? user.role,
    passwordHash: opts.password ? await sha256Hex(opts.password) : user.passwordHash,
  };
  users[idx] = updated;
  await setUsers(users);
  return updated;
}

export async function deleteUser(id: string): Promise<void> {
  const users = await getUsers();
  await setUsers(users.filter(u => u.id !== id));
}
