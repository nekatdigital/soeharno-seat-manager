import { QRManager } from '@/components/qr/QRManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QRAdmin() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">QR Code Management</h1>
        <p className="text-muted-foreground">
          Kelola QR code untuk setiap meja. Customer bisa scan QR untuk pesan langsung tanpa ke kasir.
        </p>
      </div>

      <QRManager />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Cara Kerja Sistem QR</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">📱 Untuk Customer:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>1. Scan QR code di meja</li>
                <li>2. Pilih menu (makanan, minuman, paket mancing)</li>
                <li>3. Isi nama & no HP</li>
                <li>4. Konfirmasi pesanan</li>
                <li>5. Terima notifikasi status real-time</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">👨‍💼 Untuk Admin:</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>1. Terima pesanan otomatis</li>
                <li>2. Update status: Terbaca → Diproses → Diantar</li>
                <li>3. Customer dapat notifikasi otomatis</li>
                <li>4. Print/download QR untuk setiap meja</li>
                <li>5. Lihat laporan pesanan real-time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}