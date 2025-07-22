
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JobSeekerSignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSignUp = () => {
    // In a real app, you'd have more robust validation and error handling.
    if (!email || !fullName) {
        return;
    }

    try {
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const userExists = existingUsers.some((user: any) => user.email === email);

        if (!userExists) {
            const newUser = {
                name: fullName,
                email: email,
                role: "Job Seeker",
                avatar: "https://placehold.co/40x40",
                fallback: fullName.substring(0,2).toUpperCase(),
                status: "Active",
            };
            const updatedUsers = [...existingUsers, newUser];
            localStorage.setItem('users', JSON.stringify(updatedUsers));
        }
    } catch (e) {
        console.error("Could not update users in localStorage", e);
    }
    
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create a Job Seeker Account</CardTitle>
            <CardDescription>Land your dream job with an AI-optimized resume.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" placeholder="John Doe" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="name@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" onClick={handleSignUp}>
                Create Account
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
