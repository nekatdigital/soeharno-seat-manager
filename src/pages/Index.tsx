import { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { TableMap, Table, TableStatus } from "@/components/dashboard/TableMap";
import { TableManager } from "@/components/tables/TableManager";
import { TableActions } from "@/components/tables/TableActions";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import restaurantHero from "@/assets/restaurant-hero.jpg";
import { BarChart3, Clock, Fish, TrendingUp } from "lucide-react";
import { TransactionsPage, type TransactionRecord } from "@/components/transactions/TransactionsPage";
import { Settings as SettingsPage } from "@/components/settings/Settings";
import { MenuManager } from "@/components/menu/MenuManager";
import { SimpleDB } from "@/lib/storage/simpledb";
import { UserManager } from "@/components/users/UserManager";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'owner' | 'staff'>('staff');
  const [username, setUsername] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [actionTable, setActionTable] = useState<Table | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  // Demo data (akan ditimpa dari IndexedDB jika tersedia)
  const [tables, setTables] = useState<Table[]>([
    { id: '1', number: 1, capacity: 4, status: 'empty' },
    { id: '2', number: 2, capacity: 6, status: 'occupied', customerName: 'Budi Santoso', occupiedSince: '14:30' },
    { id: '3', number: 3, capacity: 4, status: 'reserved', customerName: 'Siti Aminah', reservationTime: '16:00' },
    { id: '4', number: 4, capacity: 8, status: 'empty' },
    { id: '5', number: 5, capacity: 4, status: 'occupied', customerName: 'Ahmad Rahman', occupiedSince: '15:45' },
    { id: '6', number: 6, capacity: 6, status: 'empty' },
    { id: '7', number: 7, capacity: 4, status: 'reserved', customerName: 'Maya Sari', reservationTime: '17:30' },
    { id: '8', number: 8, capacity: 10, status: 'empty' },
  ]);

  const handleLogin = (user: string, role: 'owner' | 'staff') => {
    setUsername(user);
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setActiveSection('dashboard');
    toast({
      title: "Logout berhasil",
      description: "Terima kasih telah menggunakan sistem kami",
    });
  };

  const handleTableClick = (table: Table) => {
    setActionTable(table);
    setActionsOpen(true);
  };

  const handleTransactionComplete = (transaction: any) => {
    // Update table status to occupied and clear reservation fields
    setTables(prev =>
      prev.map(table =>
        table.id === selectedTable?.id
          ? {
              ...table,
              status: 'occupied' as TableStatus,
              customerName: transaction.customerName,
              occupiedSince: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
              reservationDate: undefined,
              reservationTime: undefined,
              reservationPeople: undefined,
            }
          : table
      )
    );

    const record: TransactionRecord = {
      ...transaction,
      id: transaction.id || Date.now().toString(),
      kind: 'dine_in',
      tableNumber: selectedTable?.number,
      timestamp: new Date().toISOString(),
      status: 'pending',
      paymentMethod: null,
      operatorRole: userRole,
    };
    setTransactions(prev => [record, ...prev]);

    setSelectedTable(null);
  };

  useEffect(() => {
    const db = new SimpleDB("appDB", 1);
    (async () => {
      const savedTables = await db.get<Table[]>("tables");
      if (savedTables && Array.isArray(savedTables)) setTables(savedTables);
      const savedTx = await db.get<any[]>("transactions");
      if (savedTx && Array.isArray(savedTx)) setTransactions(savedTx);
    })();
  }, []);

  useEffect(() => {
    const db = new SimpleDB("appDB", 1);
    db.set("tables", tables).catch(() => void 0);
  }, [tables]);

  useEffect(() => {
    const db = new SimpleDB("appDB", 1);
    db.set("transactions", transactions).catch(() => void 0);
  }, [transactions]);

  const occupiedTables = tables.filter(t => t.status === 'occupied').length;

  const updateTable = (updated: Table) => {
    setTables(prev => prev.map(t => (t.id === updated.id ? updated : t)));
  };

  const startTransaction = (t: Table) => {
    setSelectedTable(t);
  };

  const finishAndEmpty = (t: Table) => {
    const cleared: Table = { ...t, status: 'empty' as TableStatus };
    delete (cleared as any).customerName;
    delete (cleared as any).reservationDate;
    delete (cleared as any).reservationTime;
    delete (cleared as any).reservationPeople;
    delete (cleared as any).occupiedSince;
    updateTable(cleared);
  };
  const totalRevenue = 2450000; // Demo data
  const todayTransactions = 23; // Demo data

  if (!isLoggedIn) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${restaurantHero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-deep-water/80 to-ocean-teal/60"></div>
        <div className="relative z-10">
          <LoginForm onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-deep-water">Dashboard</h1>
              <Badge variant="secondary" className="bg-ocean-teal text-white">
                Selamat datang, {username}!
              </Badge>
            </div>
            
            <DashboardStats 
              totalRevenue={totalRevenue}
              todayTransactions={todayTransactions}
              occupiedTables={occupiedTables}
              totalTables={tables.length}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-deep-water">
                    <TrendingUp className="w-5 h-5" />
                    Grafik Penjualan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gradient-to-r from-warm-sand to-background rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Grafik akan ditampilkan di sini</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-deep-water">
                    <Clock className="w-5 h-5" />
                    Transaksi Terbaru
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-warm-sand/30 rounded">
                      <span className="text-sm">Meja 2 - Budi Santoso</span>
                      <span className="text-sm font-medium">Rp 125.000</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-warm-sand/30 rounded">
                      <span className="text-sm">Meja 5 - Ahmad Rahman</span>
                      <span className="text-sm font-medium">Rp 89.000</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-warm-sand/30 rounded">
                      <span className="text-sm">Meja 1 - Sari Dewi</span>
                      <span className="text-sm font-medium">Rp 156.000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'tables':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-deep-water">Manajemen Meja</h1>
            <TableManager tables={tables} onChange={setTables} />
            <TableMap tables={tables} onTableClick={handleTableClick} />
          </div>
        );

      case 'transactions':
        return (
          <div className="space-y-6">
            <TransactionsPage
              transactions={transactions}
              onUpdate={(tx) => setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t))}
              onAdd={(tx) => setTransactions(prev => [{ ...tx, operatorRole: userRole }, ...prev])}
            />
          </div>
        );

      case 'menu':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-deep-water">Kelola Menu</h1>
            <MenuManager />
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-deep-water">Kelola User</h1>
            <UserManager />
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-deep-water">Pengaturan</h1>
            <SettingsPage />
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Fitur {activeSection} sedang dalam pengembangan</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        activeSection={activeSection}
        userRole={userRole}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : 'ml-0'}`}>
        {renderContent()}
      </main>

      <TableActions
        table={actionTable}
        open={actionsOpen}
        onOpenChange={setActionsOpen}
        onUpdate={updateTable}
        onStartTransaction={startTransaction}
        onEmpty={finishAndEmpty}
      />

      {selectedTable && (
        <TransactionForm
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
          onComplete={handleTransactionComplete}
        />
      )}
    </div>
  );
};

export default Index;
