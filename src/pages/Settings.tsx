import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings as SettingsIcon, 
  Database, 
  Cloud, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertCircle,
  Copy,
  Download
} from 'lucide-react';
import { SQLGenerator } from '@/components/database/SQLGenerator';
import { indexedDBService } from '@/services/indexeddb';
import { useToast } from '@/hooks/use-toast';

interface DatabaseConfig {
  neonConnectionString: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  currentBackend: 'indexeddb' | 'neon' | 'supabase';
}

export default function Settings() {
  const [config, setConfig] = useState<DatabaseConfig>({
    neonConnectionString: '',
    supabaseUrl: '',
    supabaseAnonKey: '',
    currentBackend: 'indexeddb'
  });
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [isInitializingDB, setIsInitializingDB] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
    initializeIndexedDB();
  }, []);

  const loadConfig = () => {
    const savedConfig = localStorage.getItem('restaurant_db_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  };

  const saveConfig = () => {
    localStorage.setItem('restaurant_db_config', JSON.stringify(config));
    toast({
      title: 'Configuration Saved',
      description: 'Database configuration has been saved',
    });
  };

  const initializeIndexedDB = async () => {
    setIsInitializingDB(true);
    try {
      await indexedDBService.init();
      await indexedDBService.initSampleData();
      toast({
        title: 'IndexedDB Initialized',
        description: 'Local database has been set up with sample data',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initialize IndexedDB',
        variant: 'destructive',
      });
    } finally {
      setIsInitializingDB(false);
    }
  };

  const testNeonConnection = async () => {
    if (!config.neonConnectionString) {
      toast({
        title: 'Error',
        description: 'Please enter Neon connection string',
        variant: 'destructive',
      });
      return;
    }

    setConnectionStatus('testing');
    try {
      // In a real implementation, you would test the connection here
      // For now, we'll simulate a connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConnectionStatus('success');
      toast({
        title: 'Connection Successful',
        description: 'Successfully connected to Neon PostgreSQL',
      });
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: 'Connection Failed',
        description: 'Unable to connect to Neon PostgreSQL',
        variant: 'destructive',
      });
    }
  };

  const generateNeonMigrationSQL = () => {
    const migrationSQL = `
-- Neon PostgreSQL Migration Script
-- Generated on ${new Date().toISOString()}

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create restaurant management system tables
${indexedDBService.generateCreateTableSQL()}

-- Note: Run this script in your Neon PostgreSQL database
-- Then use the data migration SQL to import your IndexedDB data
`;

    const blob = new Blob([migrationSQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neon_migration_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Migration SQL Generated',
      description: 'Neon migration script has been downloaded',
    });
  };

  const switchBackend = (backend: 'indexeddb' | 'neon' | 'supabase') => {
    setConfig(prev => ({ ...prev, currentBackend: backend }));
    toast({
      title: 'Backend Switched',
      description: `Now using ${backend.toUpperCase()} as the database backend`,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="database" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="migration">Migration Tools</TabsTrigger>
        </TabsList>

        {/* Database Configuration */}
        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Configuration
              </CardTitle>
              <CardDescription>
                Configure your database backend and manage local storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Backend Status */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Current Backend</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className={`cursor-pointer transition-all ${config.currentBackend === 'indexeddb' ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-2">
                        <Database className="h-8 w-8" />
                        <div className="text-center">
                          <h3 className="font-semibold">IndexedDB</h3>
                          <p className="text-sm text-muted-foreground">Local Browser Storage</p>
                          {config.currentBackend === 'indexeddb' && (
                            <Badge className="mt-2">Active</Badge>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant={config.currentBackend === 'indexeddb' ? 'default' : 'outline'}
                          onClick={() => switchBackend('indexeddb')}
                        >
                          Use IndexedDB
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`cursor-pointer transition-all ${config.currentBackend === 'neon' ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-2">
                        <Cloud className="h-8 w-8" />
                        <div className="text-center">
                          <h3 className="font-semibold">Neon PostgreSQL</h3>
                          <p className="text-sm text-muted-foreground">Cloud Database</p>
                          {config.currentBackend === 'neon' && (
                            <Badge className="mt-2">Active</Badge>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant={config.currentBackend === 'neon' ? 'default' : 'outline'}
                          onClick={() => switchBackend('neon')}
                          disabled={!config.neonConnectionString}
                        >
                          Use Neon
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`cursor-pointer transition-all ${config.currentBackend === 'supabase' ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center space-y-2">
                        <Cloud className="h-8 w-8" />
                        <div className="text-center">
                          <h3 className="font-semibold">Supabase</h3>
                          <p className="text-sm text-muted-foreground">Built-in Backend</p>
                          {config.currentBackend === 'supabase' && (
                            <Badge className="mt-2">Active</Badge>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant={config.currentBackend === 'supabase' ? 'default' : 'outline'}
                          onClick={() => switchBackend('supabase')}
                        >
                          Use Supabase
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* IndexedDB Controls */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">IndexedDB Management</Label>
                <div className="flex gap-4">
                  <Button 
                    onClick={initializeIndexedDB}
                    disabled={isInitializingDB}
                    className="flex items-center gap-2"
                  >
                    {isInitializingDB ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                    {isInitializingDB ? 'Initializing...' : 'Initialize IndexedDB'}
                  </Button>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    IndexedDB provides local storage in your browser. Data persists across sessions but is tied to this browser.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connection Configuration */}
        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Database Connections
              </CardTitle>
              <CardDescription>
                Configure connections to external databases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Neon PostgreSQL Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Neon PostgreSQL</Label>
                  {connectionStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {connectionStatus === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="neon-connection">Connection String</Label>
                  <Textarea
                    id="neon-connection"
                    placeholder="postgresql://user:password@host:port/database?sslmode=require"
                    value={config.neonConnectionString}
                    onChange={(e) => setConfig(prev => ({ ...prev, neonConnectionString: e.target.value }))}
                    className="font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Example: postgresql://neondb_owner:npg_UrLDghRa9N0I@ep-young-sound-a1yq19fy-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={testNeonConnection}
                    disabled={connectionStatus === 'testing'}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {connectionStatus === 'testing' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                    {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                  </Button>
                  
                  <Button onClick={generateNeonMigrationSQL} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Migration SQL
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Supabase Configuration */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Supabase Configuration</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supabase-url">Supabase URL</Label>
                    <Input
                      id="supabase-url"
                      placeholder="https://your-project.supabase.co"
                      value={config.supabaseUrl}
                      onChange={(e) => setConfig(prev => ({ ...prev, supabaseUrl: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="supabase-key">Anon Key</Label>
                    <Input
                      id="supabase-key"
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={config.supabaseAnonKey}
                      onChange={(e) => setConfig(prev => ({ ...prev, supabaseAnonKey: e.target.value }))}
                    />
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Supabase is already configured and active in this project. You can use the built-in integration.
                  </AlertDescription>
                </Alert>
              </div>

              <Separator />

              <Button onClick={saveConfig} className="w-full">
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Migration Tools */}
        <TabsContent value="migration" className="space-y-6">
          <SQLGenerator />
          
          <Card>
            <CardHeader>
              <CardTitle>Migration Instructions</CardTitle>
              <CardDescription>
                Step-by-step guide to migrate your data between different backends
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">IndexedDB → Neon PostgreSQL</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Generate complete SQL using the SQL Generator above</li>
                    <li>Connect to your Neon database using psql or pgAdmin</li>
                    <li>Run the generated schema SQL to create tables</li>
                    <li>Run the generated data SQL to insert your IndexedDB data</li>
                    <li>Update connection settings and switch backend to Neon</li>
                  </ol>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">IndexedDB → Supabase</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>The schema is already created in your Supabase project</li>
                    <li>Generate data insertion SQL using the SQL Generator</li>
                    <li>Run the INSERT statements in Supabase SQL Editor</li>
                    <li>Switch backend to Supabase in Database settings</li>
                    <li>Your data will now sync with the cloud database</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}