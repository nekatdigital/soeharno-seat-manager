import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fish, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-sand to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-strong">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-ocean-teal to-deep-water flex items-center justify-center mb-4">
            <Fish className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-6xl font-bold text-coral-orange mb-2">404</CardTitle>
          <p className="text-xl text-deep-water font-medium">Halaman Tidak Ditemukan</p>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Maaf, halaman yang Anda cari tidak dapat ditemukan di sistem Pemancingan Soeharno 3.
          </p>
          <Button asChild className="bg-gradient-to-r from-ocean-teal to-deep-water hover:from-deep-water hover:to-ocean-teal">
            <a href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Kembali ke Beranda
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
