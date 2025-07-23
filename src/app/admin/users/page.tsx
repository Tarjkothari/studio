
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

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
    email: "admin@resumerank.ai",
    role: "Admin",
    avatar: "https://placehold.co/40x40",
    fallback: "AD",
    status: "Active",
    password: "password",
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(defaultUsers);
  
  useEffect(() => {
    try {
        const storedUsersString = localStorage.getItem('users');
        let combinedUsers: User[] = [...defaultUsers];

        if (storedUsersString) {
            const storedUsers = JSON.parse(storedUsersString) as User[];
            const storedUserEmails = new Set(defaultUsers.map(u => u.email));

            for (const user of storedUsers) {
                if (!storedUserEmails.has(user.email)) {
                    combinedUsers.push(user);
                    storedUserEmails.add(user.email);
                }
            }
        }
        
        // Ensure default admin user is always in the list and has a password
        const adminUser = combinedUsers.find(u => u.email === 'admin@resumerank.ai');
        if (adminUser) {
            if (!adminUser.password) {
                adminUser.password = 'password';
            }
        } else {
             // This case should ideally not happen if defaultUsers is set correctly.
        }

        setUsers(combinedUsers);
        localStorage.setItem('users', JSON.stringify(combinedUsers));

    } catch (e) {
        console.error("Could not retrieve users from localStorage", e);
        // If local storage is corrupt or unavailable, ensure at least the default admin is there
        setUsers(defaultUsers);
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  }, []);

  return (
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
