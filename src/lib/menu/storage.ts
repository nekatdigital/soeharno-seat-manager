import { SimpleDB } from "@/lib/storage/simpledb";
import type { MenuItem } from "@/lib/menu/types";

const KEY = "menu_items";

export async function getMenuItems(): Promise<MenuItem[]> {
  const db = new SimpleDB("appDB", 1);
  const items = await db.get<MenuItem[]>(KEY);
  return Array.isArray(items) ? items : [];
}

export async function setMenuItems(items: MenuItem[]): Promise<void> {
  const db = new SimpleDB("appDB", 1);
  await db.set(KEY, items);
}
