
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    // This is a mock login.
    // In a real app, you would have a proper backend authentication.
    setTimeout(() => {
        try {
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const user = existingUsers.find((user: any) => user.email === email);

            if (user && user.password && user.password === password) {
                 toast({
                    title: "Login Successful",
                    description: `Redirecting to ${user.role.toLowerCase()} dashboard.`,
                });
                
                localStorage.setItem('loggedInUser', JSON.stringify(user));
                
                let redirectPath = '/';
                if (user.role === 'Admin') {
                    redirectPath = '/admin';
                } else if (user.role === 'Job Provider') {
                    redirectPath = '/dashboard';
                } else if (user.role === 'Job Seeker') {
                    redirectPath = '/seeker';
                }
                router.push(redirectPath);

            } else {
                 toast({
                    variant: "destructive",
                    title: "Login Failed",
                    description: "Invalid credentials. Please check your email and password.",
                });
            }
        } catch(e) {
            console.error("Login error:", e);
             toast({
                variant: "destructive",
                title: "Login Failed",
                description: "An unexpected error occurred.",
            });
        } finally {
             setIsLoading(false);
        }
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card>
          <form onSubmit={handleLogin}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back!</CardTitle>
              <CardDescription>
                Enter your credentials to access your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
