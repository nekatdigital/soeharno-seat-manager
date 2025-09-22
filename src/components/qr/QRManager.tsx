import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { QRService, type QRTable } from '@/services/qrService';
import { RefreshCw, Download, Eye, QrCode } from 'lucide-react';

export const QRManager = () => {
  const [tables, setTables] = useState<QRTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrPreviews, setQrPreviews] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await QRService.getAllQRTables();
      setTables(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load tables',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleRegenerateQR = async (tableId: string) => {
    try {
      await QRService.regenerateQRCode(tableId);
      toast({
        title: 'Success',
        description: 'QR code regenerated successfully'
      });
      // Remove preview cache for this table
      const newPreviews = { ...qrPreviews };
      delete newPreviews[tableId];
      setQrPreviews(newPreviews);
      loadTables();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to regenerate QR code',
        variant: 'destructive'
      });
    }
  };

  const handleToggleEnabled = async (tableId: string, enabled: boolean) => {
    try {
      await QRService.toggleQREnabled(tableId, enabled);
      toast({
        title: 'Success',
        description: `QR code ${enabled ? 'enabled' : 'disabled'} successfully`
      });
      loadTables();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to toggle QR code',
        variant: 'destructive'
      });
    }
  };

  const handlePreviewQR = async (table: QRTable) => {
    if (qrPreviews[table.id]) {
      // Already have preview, show it
      showQRPreview(table.table_number, qrPreviews[table.id]);
      return;
    }

    try {
      const dataUrl = await QRService.generateQRCodeDataURL(table.id, table.qr_secret);
      setQrPreviews(prev => ({ ...prev, [table.id]: dataUrl }));
      showQRPreview(table.table_number, dataUrl);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate QR preview',
        variant: 'destructive'
      });
    }
  };

  const showQRPreview = (tableNumber: number, dataUrl: string) => {
    const newWindow = window.open('', '_blank', 'width=400,height=500');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>QR Code - Meja ${tableNumber}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
                margin: 0;
              }
              h1 { color: #333; margin-bottom: 20px; }
              img { 
                max-width: 100%; 
                border: 2px solid #ddd; 
                border-radius: 8px;
                margin: 20px 0;
              }
              .info {
                background: #f5f5f5;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                font-size: 14px;
                color: #666;
              }
              @media print {
                body { padding: 10px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>Sistem Pemancingan - Meja ${tableNumber}</h1>
            <img src="${dataUrl}" alt="QR Code Meja ${tableNumber}" />
            <div class="info">
              <p><strong>Cara Menggunakan:</strong></p>
              <p>1. Scan QR code dengan HP</p>
              <p>2. Pilih menu & pesan langsung</p>
              <p>3. Tunggu pesanan diantar</p>
            </div>
            <div class="no-print">
              <button onclick="window.print()" style="
                background: #0066cc; 
                color: white; 
                border: none; 
                padding: 10px 20px; 
                border-radius: 5px; 
                cursor: pointer;
                font-size: 16px;
              ">Print QR Code</button>
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const handleDownloadAllQR = async () => {
    try {
      const zip = await import('jszip');
      const JSZip = zip.default;
      const zipFile = new JSZip();

      for (const table of tables.filter(t => t.qr_enabled)) {
        const svg = await QRService.generateQRCodeSVG(table.id, table.qr_secret);
        zipFile.file(`meja-${table.table_number}-qr.svg`, svg);
      }

      const content = await zipFile.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qr-codes-all-tables.zip';
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'All QR codes downloaded as ZIP file'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download QR codes',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading QR codes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Management
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={loadTables} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleDownloadAllQR} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {tables.map((table) => (
              <div
                key={table.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="font-medium">Meja {table.table_number}</div>
                  <Badge variant={table.qr_enabled ? 'default' : 'secondary'}>
                    {table.qr_enabled ? 'Active' : 'Disabled'}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    Code: {table.qr_code}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={table.qr_enabled}
                      onCheckedChange={(enabled) => handleToggleEnabled(table.id, enabled)}
                    />
                    <span className="text-sm">Enabled</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewQR(table)}
                    disabled={!table.qr_enabled}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRegenerateQR(table.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Regenerate
                  </Button>
                </div>
              </div>
            ))}
            
            {tables.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tables found. Create some tables first.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};