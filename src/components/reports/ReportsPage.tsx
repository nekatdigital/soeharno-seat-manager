import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TransactionRecord } from "@/components/transactions/TransactionsPage";

function toCsv(rows: string[][]): string {
  const escape = (v: string) => '"' + v.replace(/"/g, '""') + '"';
  return rows.map(r => r.map(escape).join(',')).join('\n');
}

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export const ReportsPage = ({ transactions }: { transactions: TransactionRecord[] }) => {
  const exportCSV = () => {
    const header = [
      'Tanggal', 'Jenis', 'Meja', 'Pelanggan', 'Item', 'Total', 'Status', 'Metode', 'Operator'
    ];
    const rows = transactions.map(t => [
      new Date(t.timestamp).toLocaleString('id-ID'),
      t.kind,
      t.tableNumber ? String(t.tableNumber) : '-',
      t.customerName,
      String(t.items.reduce((s, i) => s + i.quantity, 0)),
      formatIDR(t.totalAmount),
      t.status,
      t.paymentMethod || '-',
      t.operatorRole || '-',
    ]);
    const csv = '\uFEFF' + toCsv([header, ...rows]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    const rows = transactions.map(t => `
      <tr>
        <td>${new Date(t.timestamp).toLocaleString('id-ID')}</td>
        <td>${t.kind}</td>
        <td>${t.tableNumber ?? '-'}</td>
        <td>${t.customerName}</td>
        <td>${t.items.reduce((s, i) => s + i.quantity, 0)}</td>
        <td>${formatIDR(t.totalAmount)}</td>
        <td>${t.status}</td>
        <td>${t.paymentMethod ?? '-'}</td>
        <td>${t.operatorRole ?? '-'}</td>
      </tr>
    `).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8" />
      <title>Laporan Transaksi</title>
      <style>
        body{font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px;}
        h1{margin:0 0 12px}
        table{width:100%; border-collapse: collapse}
        th,td{border:1px solid #ddd; padding:6px; font-size:12px}
        th{background:#f4f4f5; text-align:left}
      </style>
    </head><body>
      <h1>Laporan Transaksi</h1>
      <table>
        <thead><tr>
          <th>Tanggal</th><th>Jenis</th><th>Meja</th><th>Pelanggan</th><th>Item</th><th>Total</th><th>Status</th><th>Metode</th><th>Operator</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body></html>`;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  const totalPendapatan = transactions
    .filter(t => t.status === 'paid')
    .reduce((s, t) => s + t.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-deep-water">Laporan</h1>
        <div className="flex gap-2">
          <Button onClick={exportCSV}>Export Excel (CSV)</Button>
          <Button variant="outline" onClick={exportPDF}>Export PDF</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Total Lunas: <span className="font-semibold">{formatIDR(totalPendapatan)}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Tanggal</th>
                  <th className="text-left p-2">Jenis</th>
                  <th className="text-left p-2">Meja</th>
                  <th className="text-left p-2">Pelanggan</th>
                  <th className="text-left p-2">Item</th>
                  <th className="text-left p-2">Total</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Metode</th>
                  <th className="text-left p-2">Operator</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b">
                    <td className="p-2">{new Date(t.timestamp).toLocaleString('id-ID')}</td>
                    <td className="p-2">{t.kind}</td>
                    <td className="p-2">{t.tableNumber ?? '-'}</td>
                    <td className="p-2">{t.customerName}</td>
                    <td className="p-2">{t.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td className="p-2">{formatIDR(t.totalAmount)}</td>
                    <td className="p-2 capitalize">{t.status}</td>
                    <td className="p-2 capitalize">{t.paymentMethod ?? '-'}</td>
                    <td className="p-2 capitalize">{t.operatorRole ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
