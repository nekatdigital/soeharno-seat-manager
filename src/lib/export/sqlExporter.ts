import { SimpleDB } from "@/lib/storage/simpledb";
import schemaSQL from "@/sql/schema.sql?raw";
import type { Table } from "@/components/dashboard/TableMap";

const q = (v: string | number | null | undefined) => {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
};

const timez = (v?: string) => (v ? `${q(v)}::timetz` : "NULL");

export async function exportSQL(includeSchema = true): Promise<string> {
  const db = new SimpleDB("appDB", 1);
  const lines: string[] = [];
  lines.push("begin;");
  if (includeSchema) {
    lines.push(schemaSQL as string);
  }

  // dining_tables from IndexedDB key "tables"
  const tables = (await db.get<Table[]>("tables")) || [];
  for (const t of tables) {
    const cols = [
      "number",
      "capacity",
      "status",
      "customer_name",
      "occupied_since",
      "reservation_time",
    ];
    const vals = [
      q(t.number),
      q(t.capacity),
      q(t.status),
      q(t.customerName ?? null),
      timez(t.occupiedSince),
      timez(t.reservationTime),
    ];
    lines.push(
      `insert into dining_tables (${cols.join(", ")}) values (${vals.join(", ")}) on conflict (number) do update set capacity=excluded.capacity, status=excluded.status, customer_name=excluded.customer_name, occupied_since=excluded.occupied_since, reservation_time=excluded.reservation_time;`
    );
  }

  lines.push("commit;");
  return lines.join("\n");
}

export async function exportPsqlScript(connectionString?: string): Promise<string> {
  const sql = await exportSQL(true);
  if (!connectionString) return sql;
  return `cat <<'SQL' | psql '${connectionString}'\n${sql}\nSQL`;
}
