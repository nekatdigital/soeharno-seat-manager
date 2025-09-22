import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';

export interface QRTable {
  id: string;
  table_number: number;
  qr_code: string;
  qr_secret: string;
  qr_enabled: boolean;
}

export class QRService {
  // Generate QR code URL for a table
  static getQRUrl(tableId: string, secret: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/order/${tableId}/${secret}`;
  }

  // Generate QR code as SVG string
  static async generateQRCodeSVG(tableId: string, secret: string): Promise<string> {
    const url = this.getQRUrl(tableId, secret);
    return await QRCode.toString(url, {
      type: 'svg',
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  }

  // Generate QR code as data URL (base64)
  static async generateQRCodeDataURL(tableId: string, secret: string): Promise<string> {
    const url = this.getQRUrl(tableId, secret);
    return await QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  }

  // Fetch all tables with QR codes
  static async getAllQRTables(): Promise<QRTable[]> {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('id, table_number, qr_code, qr_secret, qr_enabled')
      .order('table_number');

    if (error) {
      throw new Error(`Failed to fetch QR tables: ${error.message}`);
    }

    return data || [];
  }

  // Regenerate QR code for a specific table
  static async regenerateQRCode(tableId: string): Promise<void> {
    const newSecret = crypto.randomUUID();
    const newQRCode = `table-${Date.now()}-${newSecret.substring(0, 8)}`;

    const { error } = await supabase
      .from('restaurant_tables')
      .update({ 
        qr_code: newQRCode,
        qr_secret: newSecret 
      })
      .eq('id', tableId);

    if (error) {
      throw new Error(`Failed to regenerate QR code: ${error.message}`);
    }
  }

  // Toggle QR code enabled/disabled
  static async toggleQREnabled(tableId: string, enabled: boolean): Promise<void> {
    const { error } = await supabase
      .from('restaurant_tables')
      .update({ qr_enabled: enabled })
      .eq('id', tableId);

    if (error) {
      throw new Error(`Failed to toggle QR code: ${error.message}`);
    }
  }

  // Validate QR access (check if table exists and QR is enabled)
  static async validateQRAccess(tableId: string, secret: string): Promise<QRTable | null> {
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('id, table_number, qr_code, qr_secret, qr_enabled')
      .eq('id', tableId)
      .eq('qr_secret', secret)
      .eq('qr_enabled', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }
}