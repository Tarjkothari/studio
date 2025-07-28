
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
import { Loader2, Upload, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

type User = {
  name: string;
  email: string;
  role: string;
  fallback: string;
  avatar: string;
};

export default function SettingsPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        try {
            const loggedInUserString = localStorage.getItem("loggedInUser");
            if (loggedInUserString) {
                const loggedInUser = JSON.parse(loggedInUserString);
                if (loggedInUser.role === 'Admin') {
                    setUser(loggedInUser);
                    setName(loggedInUser.name);
                    setEmail(loggedInUser.email);
                    setAvatarPreview(loggedInUser.avatar);
                }
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
                name: name,
                email: email,
                fallback: name.substring(0, 2).toUpperCase(),
                avatar: avatarPreview || user.avatar,
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

    const handleClearAllJobs = () => {
        try {
            localStorage.removeItem('jobPostings');
            localStorage.removeItem('jobApplications');
            // Also remove all generated tests associated with jobs
             const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('test_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            toast({
                title: "All Jobs Cleared",
                description: "All job postings and related applications have been removed.",
            });
            window.dispatchEvent(new Event('storage'));
        } catch (e) {
            console.error("Failed to clear job data", e);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not clear job data.",
            });
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
                    <CardTitle>Administrator Account</CardTitle>
                    <CardDescription>Manage your administrator account details.</CardDescription>
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
                                    <p className="text-xs text-muted-foreground">Upload your profile picture.</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admin-name">Name</Label>
                            <Input
                            id="admin-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
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
                    <CardTitle>System Actions</CardTitle>
                    <CardDescription>Perform administrative actions on the system. These actions are irreversible.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
                        <div>
                            <h3 className="font-semibold">Clear All Job Postings</h3>
                            <p className="text-sm text-muted-foreground">This will permanently delete all jobs and their associated applications.</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Clear All Jobs
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete all job postings, applications, and test data from the system.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearAllJobs}>
                                        Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
