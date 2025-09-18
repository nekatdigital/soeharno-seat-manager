import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
// @ts-expect-error Vite raw import for text
import schemaSQL from "@/sql/schema.sql?raw";
import { exportSQL, exportPsqlScript } from "@/lib/export/sqlExporter";
import { exportBackupJSON, importBackupJSON } from "@/lib/backup/backup";

export const Settings = () => {
  const { toast } = useToast();
  const [neonConn, setNeonConn] = useState("");
  const [neonHost, setNeonHost] = useState("pg.neon.tech");
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnon, setSupabaseAnon] = useState("");

  useEffect(() => {
    setNeonConn(localStorage.getItem("neon_connection_string") || "");
    setNeonHost(localStorage.getItem("neon_host") || "pg.neon.tech");
    setSupabaseUrl(localStorage.getItem("supabase_url") || "");
    setSupabaseAnon(localStorage.getItem("supabase_anon_key") || "");
  }, []);

  const save = () => {
    localStorage.setItem("neon_connection_string", neonConn);
    localStorage.setItem("neon_host", neonHost);
    localStorage.setItem("supabase_url", supabaseUrl);
    localStorage.setItem("supabase_anon_key", supabaseAnon);
    toast({ title: "Pengaturan disimpan", description: "Kredensial disimpan secara lokal" });
  };

  const psqlCommand = useMemo(() => {
    return neonConn ? `psql '${neonConn}'` : "psql -H pg.neon.tech";
  }, [neonConn]);

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: `${label} disalin` });
  };

  const setupScript = useMemo(() => {
    if (!neonConn) return schemaSQL as string;
    return `cat <<'SQL' | ${psqlCommand}\n${schemaSQL}\nSQL`;
  }, [neonConn, psqlCommand]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Koneksi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Neon Postgres Connection String (psql)</Label>
            <Textarea
              value={neonConn}
              onChange={(e) => setNeonConn(e.target.value)}
              placeholder="psql 'postgresql://user:pass@host/db?sslmode=require'"
            />
            <div className="flex gap-2">
              <Button type="button" onClick={() => copy(psqlCommand, "Perintah psql")}>Salin Perintah psql</Button>
              <Button type="button" variant="secondary" onClick={() => copy(neonConn, "Connection String")}>Salin Connection String</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Neon Host</Label>
            <Input value={neonHost} onChange={(e) => setNeonHost(e.target.value)} placeholder="pg.neon.tech" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Supabase URL</Label>
              <Input value={supabaseUrl} onChange={(e) => setSupabaseUrl(e.target.value)} placeholder="https://xxxx.supabase.co" />
            </div>
            <div className="space-y-2">
              <Label>Supabase Anon Key</Label>
              <Input value={supabaseAnon} onChange={(e) => setSupabaseAnon(e.target.value)} placeholder="eyJhbGci..." />
            </div>
          </div>

          <Button onClick={save}>Simpan</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inisialisasi Database Otomatis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Gunakan tombol di bawah untuk membuat seluruh skema database. Anda dapat menjalankan perintah psql di mesin Anda atau di Neon.</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => copy(setupScript, "Perintah Setup")}>
              Salin Perintah Setup (psql)
            </Button>
            <Button type="button" variant="secondary" onClick={() => copy(schemaSQL as string, "SQL Schema")}>
              Salin SQL Schema
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Button type="button" onClick={async () => {
              const dump = await exportSQL(true);
              await navigator.clipboard.writeText(dump);
              toast({ title: "SQL Dump disalin" });
            }}>
              Ekstrak Database (SQL)
            </Button>
            <Button type="button" variant="outline" onClick={async () => {
              const dump = await exportSQL(true);
              const blob = new Blob([dump], { type: "text/sql;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "export.sql";
              a.click();
              URL.revokeObjectURL(url);
              toast({ title: "File diunduh", description: "export.sql" });
            }}>
              Download SQL
            </Button>
            <Button type="button" variant="secondary" onClick={async () => {
              const script = await exportPsqlScript(neonConn || undefined);
              await navigator.clipboard.writeText(script);
              toast({ title: "Script psql + data disalin" });
            }}>
              Salin Script psql + Data
            </Button>
          </div>
          <div className="space-y-2">
            <Label>SQL Schema</Label>
            <Textarea className="min-h-[200px] font-mono" value={schemaSQL as string} readOnly />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cadangkan & Pulihkan Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Ekspor seluruh data aplikasi (meja, transaksi, menu, user, dan pengaturan) ke JSON. Impor kembali jika data dihapus oleh browser.</p>
          <div className="flex flex-wrap gap-2 items-center">
            <Button type="button" onClick={async () => {
              const json = await exportBackupJSON();
              const blob = new Blob([json], { type: "application/json;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `backup-${new Date().toISOString().slice(0,10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast({ title: "Backup diunduh" });
            }}>Ekspor JSON</Button>
            <Button type="button" variant="outline" onClick={async () => {
              const json = await exportBackupJSON();
              await navigator.clipboard.writeText(json);
              toast({ title: "Backup disalin ke clipboard" });
            }}>Salin JSON</Button>
            <label className="inline-flex">
              <input type="file" accept="application/json" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                try {
                  await importBackupJSON(text);
                  toast({ title: "Data dipulihkan", description: "Silakan muat ulang halaman jika diperlukan" });
                } catch (err: any) {
                  toast({ title: "Gagal impor", description: String(err?.message || err), variant: "destructive" });
                } finally {
                  e.currentTarget.value = "";
                }
              }} />
              <Button type="button" variant="secondary" onClick={(e) => (e.currentTarget.previousElementSibling as HTMLInputElement).click()}>Impor JSON</Button>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
