import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, DollarSign, Clock } from "lucide-react";

interface DashboardStatsProps {
  totalRevenue: number;
  todayTransactions: number;
  occupiedTables: number;
  totalTables: number;
}

export const DashboardStats = ({ 
  totalRevenue, 
  todayTransactions, 
  occupiedTables, 
  totalTables 
}: DashboardStatsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const occupancyRate = Math.round((occupiedTables / totalTables) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-ocean-teal to-deep-water text-white shadow-strong">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium opacity-90">
            Pendapatan Hari Ini
          </CardTitle>
          <DollarSign className="h-4 w-4 opacity-90" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs opacity-80 mt-1">
            <TrendingUp className="inline w-3 h-3 mr-1" />
            +12% dari kemarin
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-seafoam-green to-ocean-teal text-white shadow-strong">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium opacity-90">
            Transaksi Hari Ini
          </CardTitle>
          <Clock className="h-4 w-4 opacity-90" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayTransactions}</div>
          <p className="text-xs opacity-80 mt-1">Transaksi selesai</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-coral-orange to-secondary text-white shadow-strong">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium opacity-90">
            Okupansi Meja
          </CardTitle>
          <Users className="h-4 w-4 opacity-90" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{occupiedTables}/{totalTables}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs bg-white/20 text-white">
              {occupancyRate}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-medium">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Status Sistem
          </CardTitle>
          <div className="h-2 w-2 rounded-full bg-seafoam-green"></div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-seafoam-green">Online</div>
          <p className="text-xs text-muted-foreground mt-1">
            Semua sistem berjalan normal
          </p>
        </CardContent>
      </Card>
    </div>
  );
};