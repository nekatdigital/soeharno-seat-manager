import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { QrCode, Bell, Settings, Fish, Smartphone, Clock, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Fish className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Sistem Pemancingan QR
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Sistem pemesanan modern dengan QR Code untuk tempat pemancingan. 
            Customer scan QR, pesan langsung, dan terima notifikasi real-time!
          </p>
          
          {/* Main Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link to="/qr-admin" className="btn-nav">
              <QrCode className="h-8 w-8 text-blue-600" />
              <div className="text-left">
                <h3 className="text-xl font-semibold mb-2">QR Manager</h3>
                <p className="text-sm text-muted-foreground">
                  Kelola QR code untuk setiap meja. Generate, print, dan manage QR codes.
                </p>
              </div>
            </Link>
            
            <Link to="/order-admin" className="btn-nav">
              <Bell className="h-8 w-8 text-green-600" />
              <div className="text-left">
                <h3 className="text-xl font-semibold mb-2">Admin Pesanan</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor pesanan masuk real-time. Update status dan kelola orders.
                </p>
              </div>
            </Link>
            
            <Link to="/" className="btn-nav">
              <Settings className="h-8 w-8 text-purple-600" />
              <div className="text-left">
                <h3 className="text-xl font-semibold mb-2">Dashboard Utama</h3>
                <p className="text-sm text-muted-foreground">
                  Akses dashboard lengkap untuk manajemen restaurant.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Cara Kerja Sistem</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <QrCode className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                <CardTitle className="text-lg">1. Scan QR</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Customer scan QR code unik di setiap meja dengan smartphone
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Smartphone className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <CardTitle className="text-lg">2. Pesan Menu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pilih menu, isi nama & no HP, konfirmasi pesanan langsung dari HP
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Bell className="h-12 w-12 mx-auto text-orange-600 mb-4" />
                <CardTitle className="text-lg">3. Notifikasi Real-time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Customer dapat status: Terkirim → Terbaca → Diproses → Diantar
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                <CardTitle className="text-lg">4. Hemat Waktu</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tidak perlu antri ke kasir, pesanan langsung ke admin
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Keuntungan Sistem</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  Untuk Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Pesan tanpa antri ke kasir</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Dapat notifikasi status pesanan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Interface mudah di smartphone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Tracking pesanan real-time</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-6 w-6 text-purple-600" />
                  Untuk Pemilik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Pesanan otomatis masuk sistem</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Kurangi antrean di kasir</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Management orders yang tertata</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Data customer dan analytics</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Demo Section */}
        <Card className="text-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
          <CardHeader>
            <CardTitle className="text-2xl mb-4">Siap Untuk Mencoba?</CardTitle>
            <p className="text-blue-100">
              Mulai dengan mengelola QR code atau langsung ke admin pesanan
            </p>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/qr-admin">
                <QrCode className="h-5 w-5 mr-2" />
                Kelola QR Code
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              <Link to="/order-admin">
                <Bell className="h-5 w-5 mr-2" />
                Monitor Pesanan
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}