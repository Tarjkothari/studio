
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
import { Loader2, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

type User = {
  name: string;
  email: string;
  role: string;
  fallback: string;
  avatar: string;
  companyDescription?: string;
  companyWebsite?: string;
};

export default function AccountPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
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
        setAvatarPreview(loggedInUser.avatar);
        setCompanyDescription(loggedInUser.companyDescription || "");
        setCompanyWebsite(loggedInUser.companyWebsite || "");
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
            avatar: avatarPreview || user.avatar,
            companyDescription: companyDescription,
            companyWebsite: companyWebsite,
        };

        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));

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

        // Trigger a custom event to notify the sidebar to update
        window.dispatchEvent(new Event('storage'));

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
    <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your company details and preferences.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSaveChanges}>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarPreview || undefined} data-ai-hint="avatar" />
                    <AvatarFallback>
                        {user?.fallback}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                    <Label htmlFor="profile-picture-upload">Profile Picture</Label>
                    <div className="flex items-center gap-2">
                        <Input id="profile-picture-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        <Button asChild variant="outline">
                            <Label htmlFor="profile-picture-upload" className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" />
                                Choose File
                            </Label>
                        </Button>
                        <p className="text-xs text-muted-foreground">Upload a company logo.</p>
                    </div>
                </div>
            </div>
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

     <Card>
      <CardHeader>
        <CardTitle>Company Profile</CardTitle>
        <CardDescription>
          This information will be visible to job seekers on your company profile page.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSaveChanges}>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="company-description">About Your Company</Label>
                <Textarea 
                    id="company-description"
                    rows={5}
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    placeholder="Describe your company culture, mission, and what makes it a great place to work."
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="company-website">Company Website</Label>
                <Input 
                    id="company-website"
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="https://yourcompany.com"
                />
            </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile Info
          </Button>
        </CardFooter>
      </form>
    </Card>
    </div>
  );
}
