import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Fish, 
  LayoutDashboard, 
  Users, 
  Receipt, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu as MenuIcon
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  userRole: 'owner' | 'staff';
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ 
  activeSection, 
  userRole, 
  onSectionChange, 
  onLogout,
  isCollapsed,
  onToggle
}: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'staff'] },
    { id: 'tables', label: 'Manajemen Meja', icon: Users, roles: ['owner', 'staff'] },
    { id: 'transactions', label: 'Transaksi', icon: Receipt, roles: ['owner', 'staff'] },
    { id: 'reports', label: 'Laporan', icon: BarChart3, roles: ['owner'] },
    { id: 'menu', label: 'Kelola Menu', icon: MenuIcon, roles: ['owner'] },
    { id: 'users', label: 'Kelola User', icon: Users, roles: ['owner'] },
    { id: 'settings', label: 'Pengaturan', icon: Settings, roles: ['owner', 'staff'] },
  ];

  const availableItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className={`bg-gradient-to-b from-deep-water to-ocean-teal text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen shadow-strong`}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Fish className="w-6 h-6" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-lg">Soeharno 3</h1>
              <p className="text-xs opacity-80">Restaurant Management</p>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full mb-6 text-white hover:bg-white/20"
        >
          <MenuIcon className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">Collapse</span>}
        </Button>

        <nav className="space-y-2">
          {availableItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start text-white hover:bg-white/20 ${
                  activeSection === item.id ? 'bg-white/20' : ''
                } ${isCollapsed ? 'px-2' : 'px-4'}`}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </Button>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-4 left-0 right-0 px-4">
        {!isCollapsed && (
          <div className="mb-4 p-3 bg-white/10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant="secondary" className="bg-seafoam-green text-white">
                {userRole === 'owner' ? 'Owner' : 'Staff'}
              </Badge>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          onClick={onLogout}
          className={`w-full text-white hover:bg-red-500/20 ${
            isCollapsed ? 'px-2' : 'px-4'
          }`}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
};