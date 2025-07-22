import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Manage global application settings and configurations.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This page is a placeholder for system settings management features.</p>
            </CardContent>
        </Card>
    );
}
