import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { TableMap } from '@/components/dashboard/TableMap';
import { 
  Users, 
  ChefHat, 
  DollarSign, 
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { indexedDBService, RestaurantTable, MenuItem, Transaction } from '@/services/indexeddb';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await indexedDBService.init();
      const [tablesData, menuData, transactionsData] = await Promise.all([
        indexedDBService.getTables(),
        indexedDBService.getAll<MenuItem>('menu_items'),
        indexedDBService.getAll<Transaction>('transactions')
      ]);
      
      setTables(tablesData);
      setMenuItems(menuData);
      setTransactions(transactionsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTableStatus = async (tableId: string, status: RestaurantTable['status'], customerName?: string) => {
    try {
      const table = tables.find(t => t.id === tableId);
      if (!table) return;

      const updatedTable = {
        ...table,
        status,
        customer_name: customerName || undefined,
        occupied_since: status === 'occupied' ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString()
      };

      await indexedDBService.update('restaurant_tables', updatedTable);
      setTables(prev => prev.map(t => t.id === tableId ? updatedTable : t));
      
      toast({
        title: 'Table Updated',
        description: `Table ${table.table_number} status changed to ${status}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update table status',
        variant: 'destructive',
      });
    }
  };

  // Calculate statistics
  const stats = {
    totalTables: tables.length,
    occupiedTables: tables.filter(t => t.status === 'occupied').length,
    availableTables: tables.filter(t => t.status === 'available').length,
    reservedTables: tables.filter(t => t.status === 'reserved').length,
    totalMenuItems: menuItems.length,
    availableMenuItems: menuItems.filter(m => m.is_available).length,
    todayTransactions: transactions.filter(t => {
      const today = new Date().toDateString();
      return new Date(t.created_at).toDateString() === today;
    }).length,
    todayRevenue: transactions
      .filter(t => {
        const today = new Date().toDateString();
        return new Date(t.created_at).toDateString() === today && t.status === 'completed';
      })
      .reduce((sum, t) => sum + t.total_amount, 0)
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
        <Button onClick={loadDashboardData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTables}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default">{stats.occupiedTables} Occupied</Badge>
              <Badge variant="secondary">{stats.availableTables} Available</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMenuItems}</div>
            <p className="text-sm text-muted-foreground">
              {stats.availableMenuItems} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayTransactions}</div>
            <p className="text-sm text-muted-foreground">
              Orders processed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {stats.todayRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Revenue from completed orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tables" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tables">Table Management</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Table Management */}
        <TabsContent value="tables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Table Status</CardTitle>
              <CardDescription>
                Monitor and manage restaurant table availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tables.map((table) => (
                  <Card key={table.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Table {table.table_number}</CardTitle>
                        <Badge variant={
                          table.status === 'available' ? 'default' :
                          table.status === 'occupied' ? 'destructive' :
                          table.status === 'reserved' ? 'secondary' : 'outline'
                        }>
                          {table.status === 'available' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {table.status === 'occupied' && <XCircle className="h-3 w-3 mr-1" />}
                          {table.status === 'reserved' && <Clock className="h-3 w-3 mr-1" />}
                          {table.status === 'maintenance' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {table.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Capacity: {table.capacity} people
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {table.customer_name && (
                        <p className="text-sm">
                          <strong>Customer:</strong> {table.customer_name}
                        </p>
                      )}
                      {table.occupied_since && (
                        <p className="text-sm text-muted-foreground">
                          Occupied since: {new Date(table.occupied_since).toLocaleTimeString()}
                        </p>
                      )}
                      {table.reservation_time && (
                        <p className="text-sm text-muted-foreground">
                          Reserved for: {new Date(table.reservation_time).toLocaleString()}
                        </p>
                      )}
                      
                      <div className="flex gap-2 flex-wrap">
                        {table.status !== 'available' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateTableStatus(table.id, 'available')}
                          >
                            Make Available
                          </Button>
                        )}
                        {table.status === 'available' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => {
                                const customerName = prompt('Enter customer name:');
                                if (customerName) {
                                  updateTableStatus(table.id, 'occupied', customerName);
                                }
                              }}
                            >
                              Occupy
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => {
                                const customerName = prompt('Enter customer name for reservation:');
                                if (customerName) {
                                  updateTableStatus(table.id, 'reserved', customerName);
                                }
                              }}
                            >
                              Reserve
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Orders */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Latest orders and transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 10)
                    .map((transaction) => {
                      const table = tables.find(t => t.id === transaction.table_id);
                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">
                                {transaction.customer_name || 'Walk-in Customer'}
                              </h4>
                              <Badge variant={
                                transaction.status === 'completed' ? 'default' :
                                transaction.status === 'pending' ? 'secondary' : 'destructive'
                              }>
                                {transaction.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {table ? `Table ${table.table_number}` : 'Takeaway'} • 
                              {new Date(transaction.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">Rp {transaction.total_amount.toLocaleString()}</p>
                            {transaction.payment_method && (
                              <p className="text-sm text-muted-foreground">{transaction.payment_method}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <DashboardStats 
            totalRevenue={stats.todayRevenue}
            todayTransactions={stats.todayTransactions}
            occupiedTables={stats.occupiedTables}
            totalTables={stats.totalTables}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}