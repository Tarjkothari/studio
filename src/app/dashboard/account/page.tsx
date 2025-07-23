
"use client";

import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

type User = {
  name: string;
  email: string;
  role: string;
  fallback: string;
};

export default function AccountPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    try {
      const loggedInUserString = localStorage.getItem("loggedInUser");
      if (loggedInUserString) {
        const loggedInUser = JSON.parse(loggedInUserString);
        setUser(loggedInUser);
        setCompanyName(loggedInUser.name);
        setEmail(loggedInUser.email);
      }
    } catch (e) {
      console.error("Failed to load user from local storage", e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load your account details.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleSaveChanges = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    if (!user) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No user is logged in.",
        });
        setIsSaving(false);
        return;
    }

    try {
        const updatedUser = {
            ...user,
            name: companyName,
            email: email,
            fallback: companyName.substring(0,2).toUpperCase(),
        };

        // Update loggedInUser in localStorage
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));

        // Update user in the 'users' array in localStorage
        const allUsersString = localStorage.getItem('users');
        if (allUsersString) {
            let allUsers = JSON.parse(allUsersString);
            const userIndex = allUsers.findIndex((u: User) => u.email === user.email);

            if (userIndex > -1) {
                allUsers[userIndex] = updatedUser;
                localStorage.setItem('users', JSON.stringify(allUsers));
            }
        }
        
        setUser(updatedUser);

        toast({
            title: "Success",
            description: "Your account details have been updated.",
        });

    } catch (e) {
        console.error("Failed to save user to local storage", e);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save your account details.",
        });
    } finally {
        setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
        <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your company details and preferences.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSaveChanges}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Work Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
