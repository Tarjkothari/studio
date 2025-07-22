import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AdminDashboardPage() {
    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome, Admin</CardTitle>
                    <CardDescription>Manage your application from this central hub.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                       Use the navigation on the left to manage users and configure system settings.
                    </p>
                    <div className="mt-6">
                        <Button asChild>
                            <Link href="/admin/users">
                                Manage Users
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
