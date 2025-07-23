
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
  
  useEffect(() => {
    try {
        const storedUsersString = localStorage.getItem('users');
        const storedUsers = storedUsersString ? JSON.parse(storedUsersString) : [];

        // Create a map of stored users to easily update or add the admin
        const userMap = new Map(storedUsers.map((u: User) => [u.email, u]));

        // Ensure the specified admin user exists and has the correct credentials
        const adminUser = defaultUsers[0];
        userMap.set(adminUser.email, {
            ...adminUser,
            // If an admin user already exists, merge to keep any other details but enforce credentials
            ...(userMap.get(adminUser.email) || {}),
            ...adminUser,
        });

        // Convert the map back to an array
        const combinedUsers = Array.from(userMap.values());
        
        setUsers(combinedUsers);
        localStorage.setItem('users', JSON.stringify(combinedUsers));

    } catch (e) {
        console.error("Could not retrieve or update users from localStorage", e);
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
