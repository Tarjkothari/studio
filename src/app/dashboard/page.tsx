import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to your Dashboard</CardTitle>
                    <CardDescription>Here's where you can manage your recruitment process.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Use the tools in the sidebar to get started. You can rank candidates for a job opening or check a job description for potential bias.
                    </p>
                    <div className="mt-6 flex gap-4">
                        <Button asChild>
                            <Link href="/dashboard/ranker">
                                Rank Candidates
                            </Link>
                        </Button>
                         <Button variant="outline" asChild>
                            <Link href="/dashboard/bias-checker">
                                Check for Bias
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
