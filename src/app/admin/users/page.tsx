
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type User = {
    name: string;
    email: string;
    role: string;
    avatar: string;
    fallback: string;
    status: string;
    password?: string;
};

const defaultUsers: User[] = [
  {
    name: "Admin",
    email: "tarjkothari2004@gmail.com",
    role: "Admin",
    avatar: "https://placehold.co/40x40",
    fallback: "AD",
    status: "Active",
    password: "Tarj2108",
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    try {
        const storedUsersString = localStorage.getItem('users');
        const storedUsers = storedUsersString ? JSON.parse(storedUsersString) : [];

        const userMap = new Map(storedUsers.map((u: User) => [u.email, u]));

        const adminUser = defaultUsers[0];
        userMap.set(adminUser.email, {
            ...(userMap.get(adminUser.email) || {}),
            ...adminUser,
        });

        const combinedUsers = Array.from(userMap.values());
        
        setUsers(combinedUsers);
        localStorage.setItem('users', JSON.stringify(combinedUsers));

        const loggedInUserString = localStorage.getItem('loggedInUser');
        if (loggedInUserString) {
            const loggedInUser = JSON.parse(loggedInUserString);
            setLoggedInUserEmail(loggedInUser.email);
        }

    } catch (e) {
        console.error("Could not retrieve or update users from localStorage", e);
        setUsers(defaultUsers);
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  }, []);

  const handleRemoveUser = (emailToRemove: string) => {
    try {
        const updatedUsers = users.filter(user => user.email !== emailToRemove);
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        toast({
            title: "User Removed",
            description: "The user has been successfully removed from the system.",
        });
    } catch(e) {
        console.error("Failed to remove user from localStorage", e);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not remove the user.",
        });
    }
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>A list of all users in the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.email}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                       <AvatarImage src={user.avatar} data-ai-hint="avatar" />
                       <AvatarFallback>{user.fallback}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'Admin' ? 'default' : user.role === 'Job Provider' ? 'secondary' : 'outline'}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'Active' ? 'secondary' : 'destructive' } className={user.status === 'Active' ? 'text-green-700 bg-green-100' : ''}>{user.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                    {user.email !== loggedInUserEmail ? (
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove User</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the user account
                                    and remove their data from our servers.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveUser(user.email)}>
                                    Continue
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </>
  );
}
