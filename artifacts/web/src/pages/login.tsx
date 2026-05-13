import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@/lib/mock-hooks";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("hr.admin@firstbankng.com");
  const [password, setPassword] = useState("admin123");
  const [, setLocation] = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { toast } = useToast();
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await loginMutation.mutateAsync({ data: { email, password } });
      setAuth(result.user, result.token);
      setLocation("/dashboard");
    } catch {
      toast({ title: "Login failed", description: "Invalid email or password.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-2xl font-bold tracking-tight text-primary mb-1">TalentFlow</div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest">Recruitment Automation Platform</div>
        </div>

        <div className="bg-card border border-border rounded-sm p-8">
          <h1 className="text-lg font-semibold mb-6 text-card-foreground">Sign in to your account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 text-sm"
                required
              />
            </div>
            <Button type="submit" className="w-full h-9" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Demo accounts:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>HR Admin</span><span className="font-mono">hr.admin@firstbankng.com</span></div>
              <div className="flex justify-between"><span>Hiring Manager</span><span className="font-mono">hm.ops@firstbankng.com</span></div>
              <div className="flex justify-between"><span>Executive</span><span className="font-mono">ceo@firstbankng.com</span></div>
              <div className="flex justify-between"><span>Password for all</span><span className="font-mono">admin123</span></div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">First Bank Nigeria · Confidential Internal System</p>
      </div>
    </div>
  );
}
