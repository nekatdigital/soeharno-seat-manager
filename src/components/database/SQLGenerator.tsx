import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Database, Copy, Download, RefreshCw } from 'lucide-react';
import { indexedDBService } from '@/services/indexeddb';
import { useToast } from '@/hooks/use-toast';

export const SQLGenerator: React.FC = () => {
  const [generatedSQL, setGeneratedSQL] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateCreateTableSQL = async () => {
    setIsGenerating(true);
    try {
      const sql = indexedDBService.generateCreateTableSQL();
      setGeneratedSQL(sql);
      toast({
        title: 'SQL Schema Generated',
        description: 'Database schema SQL has been generated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate SQL schema',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateInsertSQL = async () => {
    setIsGenerating(true);
    try {
      const sql = await indexedDBService.generateInsertSQL();
      setGeneratedSQL(sql);
      toast({
        title: 'Insert SQL Generated',
        description: 'Data insertion SQL has been generated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate insert SQL',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCompleteSQL = async () => {
    setIsGenerating(true);
    try {
      const createSQL = indexedDBService.generateCreateTableSQL();
      const insertSQL = await indexedDBService.generateInsertSQL();
      const completeSQL = `${createSQL}\n\n${insertSQL}`;
      setGeneratedSQL(completeSQL);
      toast({
        title: 'Complete SQL Generated',
        description: 'Full database schema and data SQL has been generated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate complete SQL',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedSQL);
      toast({
        title: 'Copied',
        description: 'SQL has been copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const downloadSQL = () => {
    const blob = new Blob([generatedSQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `restaurant_db_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Downloaded',
      description: 'SQL file has been downloaded',
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <CardTitle>SQL Generator</CardTitle>
        </div>
        <CardDescription>
          Generate SQL commands to create database schema and migrate data from IndexedDB
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={generateCreateTableSQL}
            disabled={isGenerating}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Generate Schema
          </Button>
          
          <Button 
            onClick={generateInsertSQL}
            disabled={isGenerating}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Generate Data
          </Button>
          
          <Button 
            onClick={generateCompleteSQL}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Generate Complete SQL
          </Button>
        </div>

        <Separator />

        {/* SQL Output */}
        {generatedSQL && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Generated SQL</h3>
                <Badge variant="secondary">
                  {generatedSQL.split('\n').length} lines
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadSQL}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
            
            <Textarea
              value={generatedSQL}
              readOnly
              className="min-h-[400px] font-mono text-sm"
              placeholder="Generated SQL will appear here..."
            />
          </div>
        )}

        {/* Instructions */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">How to use:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li><strong>Generate Schema:</strong> Creates SQL commands to set up database tables and indexes</li>
            <li><strong>Generate Data:</strong> Creates INSERT statements from your current IndexedDB data</li>
            <li><strong>Generate Complete SQL:</strong> Combines both schema and data for full database migration</li>
            <li><strong>Copy/Download:</strong> Use the generated SQL in your PostgreSQL database (Neon, Supabase, etc.)</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};