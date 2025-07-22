import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const users = [
  {
    name: "Hiring Manager",
    email: "manager@company.com",
    role: "Job Provider",
    avatar: "https://placehold.co/40x40",
    fallback: "HM",
    status: "Active",
  },
  {
    name: "Jane Doe",
    email: "jane.d@example.com",
    role: "Job Seeker",
    avatar: "https://placehold.co/40x40",
    fallback: "JD",
    status: "Active",
  },
    {
    name: "Admin",
    email: "admin@resumerank.ai",
    role: "Admin",
    avatar: "https://placehold.co/40x40",
    fallback: "AD",
    status: "Active",
  },
  {
    name: "Peter Jones",
    email: "peter.j@work.net",
    role: "Job Provider",
    avatar: "https://placehold.co/40x40",
    fallback: "PJ",
    status: "Inactive",
  },
];

export default function UsersPage() {
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
                       <AvatarImage src={user.avatar} />
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
