import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  ChefHat, 
  Database, 
  Settings as SettingsIcon, 
  BarChart3,
  Users,
  Clock,
  ArrowRight
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center space-y-6 mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="h-12 w-12 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900">Restaurant Manager</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete restaurant management system with IndexedDB local storage and cloud database integration
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary">
              <Database className="h-3 w-3 mr-1" />
              IndexedDB + Cloud Ready
            </Badge>
            <Badge variant="outline">
              PostgreSQL Compatible
            </Badge>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <CardTitle>Dashboard</CardTitle>
              </div>
              <CardDescription>
                Real-time overview of tables, orders, and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/dashboard">
                <Button className="w-full flex items-center gap-2">
                  View Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                <CardTitle>Database Settings</CardTitle>
              </div>
              <CardDescription>
                Configure IndexedDB, Neon PostgreSQL, and data migration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/settings">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  Configure Database
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <CardTitle>SQL Generator</CardTitle>
              </div>
              <CardDescription>
                Generate SQL commands for database migration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/settings">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  Generate SQL
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
