import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Fish, Users } from "lucide-react";

interface LoginFormProps {
  onLogin: (username: string, role: 'owner' | 'staff') => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Try authenticate against stored users first
    try {
      const { getUsers } = await import("@/lib/users/storage");
      const { sha256Hex } = await import("@/lib/users/crypto");
      const users = await getUsers();
      const found = users.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (found) {
        const hash = await sha256Hex(password);
        if (hash === found.passwordHash) {
          toast({ title: "Login berhasil", description: `Selamat datang, ${found.name}!` });
          onLogin(found.username, found.role);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      // ignore and fallback to demo
    }

    // Fallback to demo credentials
    const demoCredentials = { owner: 'admin123', staff: 'staff123' } as const;
    const demoRole: 'owner' | 'staff' = username === 'owner' ? 'owner' : 'staff';
    const expected = demoCredentials[demoRole];

    if (password === expected) {
      toast({ title: "Login berhasil", description: `Selamat datang, ${username}!` });
      onLogin(username, demoRole);
    } else {
      toast({ title: "Login gagal", description: "Username atau password salah", variant: "destructive" });
    }

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md shadow-strong">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-ocean-teal to-deep-water flex items-center justify-center mb-4">
          <Fish className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-deep-water">
          Pemancingan Soeharno 3
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Sistem Manajemen Restoran & Pemancingan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-12"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-gradient-to-r from-ocean-teal to-deep-water hover:from-deep-water hover:to-ocean-teal transition-all duration-300 shadow-medium"
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-warm-sand rounded-lg">
          <p className="text-sm font-medium text-deep-water mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Demo Credentials:
          </p>
          <div className="text-xs space-y-1 text-muted-foreground">
            <p><strong>Owner:</strong> username: owner, password: admin123</p>
            <p><strong>Staff:</strong> username: staff, password: staff123</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
