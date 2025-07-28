
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function JobProviderSignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const handleSignUp = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    if (!email || !companyName || !password) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out all fields.",
        });
        setIsLoading(false);
        return;
    }

    try {
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const userExists = existingUsers.some((user: any) => user.email === email);

        if (userExists) {
            toast({
                variant: "destructive",
                title: "User Exists",
                description: "An account with this email already exists.",
            });
            setIsLoading(false);
            return;
        }

        const newUser = {
            name: companyName,
            email: email,
            password: password,
            role: "Job Provider",
            avatar: "https://placehold.co/40x40",
            fallback: companyName.substring(0,2).toUpperCase(),
            status: "Active",
        };
        const updatedUsers = [...existingUsers, newUser];
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        toast({
            title: "Account Created",
            description: "Please log in to continue.",
        });
        router.push('/login');

    } catch (e) {
        console.error("Could not update users in localStorage", e);
        toast({
            variant: "destructive",
            title: "Sign-up Failed",
            description: "An unexpected error occurred.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card>
            <form onSubmit={handleSignUp}>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Create a Job Provider Account</CardTitle>
                    <CardDescription>Start finding top talent today.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" placeholder="Your Company Inc." required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input id="email" type="email" placeholder="name@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground"
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Login
                    </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
      </div>
    </div>
  );
}
