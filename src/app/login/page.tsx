
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
    // In a real app, you would have authentication logic here.
    setTimeout(() => {
      let role = '';
      let name = "";
      let redirectPath = '';
      let loginSuccess = false;

      // Special admin user
      if (email.toLowerCase() === 'admin@resumerank.ai' && password === 'password') {
            toast({
            title: "Login Successful",
            description: "Redirecting to admin dashboard.",
            });
            role = "Admin";
            name = "Admin";
            redirectPath = '/admin';
            loginSuccess = true;
      } else if (email.includes('@') && email.split('@')[1].includes('.')) {
          // A simple check for a valid-looking company email vs a personal one.
          // In a real app, roles would be stored in a database.
          const domain = email.split('@')[1];
          if(domain !== 'gmail.com' && domain !== 'yahoo.com' && domain !== 'outlook.com'){
              toast({
                  title: "Login Successful",
                  description: "Redirecting to job provider dashboard.",
              });
              role = "Job Provider";
              name = "Hiring Manager"; // Default name for providers
              redirectPath = '/dashboard';
              loginSuccess = true;
          } else {
              toast({
                  title: "Login Successful",
                  description: "Redirecting to job seeker dashboard.",
              });
              role = "Job Seeker";
              name = email.split('@')[0];
              redirectPath = '/seeker';
              loginSuccess = true;
          }
      } else {
            toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid credentials.",
            });
      }
        
        if (loginSuccess) {
            try {
                const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
                let userExists = false;
                
                // Find and update the user if they exist, otherwise add them.
                const updatedUsers = existingUsers.map((user: any) => {
                    if (user.email === email) {
                        userExists = true;
                        // Update role and name on login, in case it changed
                        user.role = role;
                        user.name = name;
                        return user;
                    }
                    return user;
                });

                const currentUser = {
                    name: name,
                    email: email,
                    role: role,
                    avatar: "https://placehold.co/40x40",
                    fallback: name.substring(0,2).toUpperCase(),
                    status: "Active",
                };

                if (!userExists) {
                    updatedUsers.push(currentUser);
                }
                
                localStorage.setItem('users', JSON.stringify(updatedUsers));
                localStorage.setItem('loggedInUser', JSON.stringify(currentUser));

            } catch (e) {
                console.error("Could not update users in localStorage", e);
            }
            router.push(redirectPath);
        }

        setIsLoading(false);
    }, 1000)
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
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
