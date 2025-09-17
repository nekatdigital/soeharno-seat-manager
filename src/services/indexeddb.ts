// IndexedDB service for restaurant management system
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'owner' | 'admin' | 'staff';
  created_at: string;
  updated_at: string;
}

export interface RestaurantTable {
  id: string;
  table_number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  customer_name?: string;
  occupied_since?: string;
  reservation_time?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: 'food' | 'drink' | 'dessert' | 'appetizer';
  is_available: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  table_id?: string;
  customer_name?: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  payment_method?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  created_at: string;
}

class IndexedDBService {
  private dbName = 'RestaurantDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('username', 'username', { unique: true });
          userStore.createIndex('email', 'email', { unique: true });
        }

        if (!db.objectStoreNames.contains('restaurant_tables')) {
          const tableStore = db.createObjectStore('restaurant_tables', { keyPath: 'id' });
          tableStore.createIndex('table_number', 'table_number', { unique: true });
          tableStore.createIndex('status', 'status');
        }

        if (!db.objectStoreNames.contains('menu_items')) {
          const menuStore = db.createObjectStore('menu_items', { keyPath: 'id' });
          menuStore.createIndex('category', 'category');
          menuStore.createIndex('is_available', 'is_available');
        }

        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('table_id', 'table_id');
          transactionStore.createIndex('status', 'status');
          transactionStore.createIndex('user_id', 'user_id');
        }

        if (!db.objectStoreNames.contains('transaction_items')) {
          const itemStore = db.createObjectStore('transaction_items', { keyPath: 'id' });
          itemStore.createIndex('transaction_id', 'transaction_id');
          itemStore.createIndex('menu_item_id', 'menu_item_id');
        }
      };
    });
  }

  // Generic CRUD operations
  async add<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async update<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, id: string): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Specific methods for restaurant operations
  async getTables(): Promise<RestaurantTable[]> {
    return this.getAll<RestaurantTable>('restaurant_tables');
  }

  async getAvailableTables(): Promise<RestaurantTable[]> {
    const tables = await this.getTables();
    return tables.filter(table => table.status === 'available');
  }

  async getMenuByCategory(category?: string): Promise<MenuItem[]> {
    const items = await this.getAll<MenuItem>('menu_items');
    return category ? items.filter(item => item.category === category) : items;
  }

  async getTransactionsByStatus(status?: string): Promise<Transaction[]> {
    const transactions = await this.getAll<Transaction>('transactions');
    return status ? transactions.filter(tx => tx.status === status) : transactions;
  }

  // SQL Generation Methods
  generateCreateTableSQL(): string {
    return `
-- Restaurant Management System Schema

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Restaurant tables
CREATE TABLE restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER UNIQUE NOT NULL,
  capacity INTEGER DEFAULT 4 CHECK (capacity > 0),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  customer_name VARCHAR(100),
  occupied_since TIMESTAMP WITH TIME ZONE,
  reservation_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Menu items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category VARCHAR(50) DEFAULT 'food' CHECK (category IN ('food', 'drink', 'dessert', 'appetizer')),
  is_available BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES restaurant_tables(id),
  customer_name VARCHAR(100),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id UUID
);

-- Transaction items
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_restaurant_tables_status ON restaurant_tables(status);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_table_id ON transactions(table_id);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
`;
  }

  async generateInsertSQL(): Promise<string> {
    const tables = await this.getTables();
    const menuItems = await this.getAll<MenuItem>('menu_items');
    const transactions = await this.getAll<Transaction>('transactions');
    
    let sql = '-- Insert data from IndexedDB\n\n';

    if (tables.length > 0) {
      sql += '-- Restaurant Tables\n';
      tables.forEach(table => {
        sql += `INSERT INTO restaurant_tables (id, table_number, capacity, status, customer_name, occupied_since, reservation_time, created_at, updated_at) VALUES ('${table.id}', ${table.table_number}, ${table.capacity}, '${table.status}', ${table.customer_name ? `'${table.customer_name}'` : 'NULL'}, ${table.occupied_since ? `'${table.occupied_since}'` : 'NULL'}, ${table.reservation_time ? `'${table.reservation_time}'` : 'NULL'}, '${table.created_at}', '${table.updated_at}');\n`;
      });
      sql += '\n';
    }

    if (menuItems.length > 0) {
      sql += '-- Menu Items\n';
      menuItems.forEach(item => {
        sql += `INSERT INTO menu_items (id, name, description, price, category, is_available, image_url, created_at, updated_at) VALUES ('${item.id}', '${item.name}', ${item.description ? `'${item.description}'` : 'NULL'}, ${item.price}, '${item.category}', ${item.is_available}, ${item.image_url ? `'${item.image_url}'` : 'NULL'}, '${item.created_at}', '${item.updated_at}');\n`;
      });
      sql += '\n';
    }

    return sql;
  }

  // Initialize with sample data
  async initSampleData(): Promise<void> {
    const now = new Date().toISOString();

    // Sample tables
    const sampleTables: RestaurantTable[] = [
      { id: '1', table_number: 1, capacity: 4, status: 'available', created_at: now, updated_at: now },
      { id: '2', table_number: 2, capacity: 2, status: 'available', created_at: now, updated_at: now },
      { id: '3', table_number: 3, capacity: 6, status: 'occupied', customer_name: 'John Doe', occupied_since: now, created_at: now, updated_at: now },
      { id: '4', table_number: 4, capacity: 4, status: 'available', created_at: now, updated_at: now },
      { id: '5', table_number: 5, capacity: 8, status: 'reserved', customer_name: 'Jane Smith', reservation_time: now, created_at: now, updated_at: now }
    ];

    // Sample menu items
    const sampleMenuItems: MenuItem[] = [
      { id: '1', name: 'Nasi Goreng', description: 'Indonesian fried rice with chicken and vegetables', price: 25000, category: 'food', is_available: true, created_at: now, updated_at: now },
      { id: '2', name: 'Mie Ayam', description: 'Chicken noodles with meatballs', price: 20000, category: 'food', is_available: true, created_at: now, updated_at: now },
      { id: '3', name: 'Gado-gado', description: 'Indonesian salad with peanut sauce', price: 18000, category: 'food', is_available: true, created_at: now, updated_at: now },
      { id: '4', name: 'Teh Manis', description: 'Sweet iced tea', price: 5000, category: 'drink', is_available: true, created_at: now, updated_at: now },
      { id: '5', name: 'Kopi Hitam', description: 'Black coffee', price: 8000, category: 'drink', is_available: true, created_at: now, updated_at: now },
      { id: '6', name: 'Es Campur', description: 'Mixed ice dessert', price: 15000, category: 'dessert', is_available: true, created_at: now, updated_at: now }
    ];

    // Add sample data
    for (const table of sampleTables) {
      try {
        await this.add('restaurant_tables', table);
      } catch (error) {
        // Item might already exist
      }
    }

    for (const item of sampleMenuItems) {
      try {
        await this.add('menu_items', item);
      } catch (error) {
        // Item might already exist
      }
    }
  }
}

export const indexedDBService = new IndexedDBService();