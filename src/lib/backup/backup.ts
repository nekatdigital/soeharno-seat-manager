import { SimpleDB } from "@/lib/storage/simpledb";

const IDB_KEYS = ["tables", "transactions", "menu_items", "users"] as const;
const LS_KEYS = [
  "supabase_url",
  "supabase_anon_key",
  "neon_connection_string",
  "neon_host",
] as const;

type BackupPayload = {
  version: number;
  timestamp: string;
  idb: Record<string, unknown>;
  localStorage: Record<string, string | null>;
};

export async function exportBackup(): Promise<BackupPayload> {
  const db = new SimpleDB("appDB", 1);
  const idb: Record<string, unknown> = {};
  for (const key of IDB_KEYS) {
    try {
      idb[key] = await db.get(key as string);
    } catch {
      idb[key] = null;
    }
  }
  const ls: Record<string, string | null> = {};
  for (const k of LS_KEYS) {
    ls[k] = localStorage.getItem(k) as string | null;
  }
  return {
    version: 1,
    timestamp: new Date().toISOString(),
    idb,
    localStorage: ls,
  };
}

export async function exportBackupJSON(): Promise<string> {
  const payload = await exportBackup();
  return JSON.stringify(payload, null, 2);
}

export async function importBackupJSON(json: string): Promise<void> {
  const parsed = JSON.parse(json) as BackupPayload;
  if (!parsed || typeof parsed !== "object") throw new Error("File tidak valid");
  const db = new SimpleDB("appDB", 1);
  if (parsed.idb && typeof parsed.idb === "object") {
    for (const key of Object.keys(parsed.idb)) {
      await db.set(key, (parsed.idb as any)[key]);
    }
  }
  if (parsed.localStorage && typeof parsed.localStorage === "object") {
    for (const [k, v] of Object.entries(parsed.localStorage)) {
      if (typeof v === "string") localStorage.setItem(k, v);
      else localStorage.removeItem(k);
    }
  }
}
