
"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";


export default function SeekerDashboardPage() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, [])

    if (!isClient) {
        return null;
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome to your Dashboard</CardTitle>
                    <CardDescription>Everything you need to land your next job.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Use our AI-powered Resume Improver to tailor your resume for any job description and boost your chances of getting an interview.
                    </p>
                    <div className="mt-6">
                        <Button asChild>
                            <Link href="/seeker/improve-resume">
                                Improve My Resume
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
