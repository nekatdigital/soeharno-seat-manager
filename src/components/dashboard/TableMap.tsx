import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckCircle } from "lucide-react";

export type TableStatus = 'empty' | 'occupied' | 'reserved';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  customerName?: string;
  reservationTime?: string;
  occupiedSince?: string;
}

interface TableMapProps {
  tables: Table[];
  onTableClick: (table: Table) => void;
}

const getStatusColor = (status: TableStatus) => {
  switch (status) {
    case 'empty': return 'bg-table-empty hover:bg-table-empty/80';
    case 'occupied': return 'bg-table-occupied hover:bg-table-occupied/80';
    case 'reserved': return 'bg-table-reserved hover:bg-table-reserved/80';
  }
};

const getStatusText = (status: TableStatus) => {
  switch (status) {
    case 'empty': return 'Kosong';
    case 'occupied': return 'Terisi';
    case 'reserved': return 'Reservasi';
  }
};

const getStatusIcon = (status: TableStatus) => {
  switch (status) {
    case 'empty': return <CheckCircle className="w-4 h-4" />;
    case 'occupied': return <Users className="w-4 h-4" />;
    case 'reserved': return <Clock className="w-4 h-4" />;
  }
};

export const TableMap = ({ tables, onTableClick }: TableMapProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-deep-water flex items-center gap-2">
          <Users className="w-5 h-5" />
          Denah Meja
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <Button
              key={table.id}
              variant="outline"
              className={`h-24 p-4 flex flex-col items-center justify-center gap-2 border-2 ${getStatusColor(table.status)} text-white font-medium transition-all duration-200 hover:scale-105 shadow-soft hover:shadow-medium`}
              onClick={() => onTableClick(table)}
            >
              <div className="text-lg font-bold">Meja {table.number}</div>
              <div className="flex items-center gap-1 text-xs">
                {getStatusIcon(table.status)}
                {getStatusText(table.status)}
              </div>
              <div className="text-xs opacity-90">
                {table.capacity} orang
              </div>
            </Button>
          ))}
        </div>
        
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-table-empty"></div>
            <span className="text-sm text-muted-foreground">Kosong</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-table-occupied"></div>
            <span className="text-sm text-muted-foreground">Terisi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-table-reserved"></div>
            <span className="text-sm text-muted-foreground">Reservasi</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};