import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account details and preferences.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This page is a placeholder for account management features.</p>
            </CardContent>
        </Card>
    );
}
