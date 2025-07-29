
"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Briefcase, FileCheck2, FileUp, Settings } from "lucide-react";


export default function SeekerDashboardPage() {
    const [userName, setUserName] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        try {
            const userString = localStorage.getItem('loggedInUser');
            if (userString) {
                const user = JSON.parse(userString);
                setUserName(user.name);
            }
        } catch (e) {
            console.error("Failed to load user from local storage", e);
        }
    }, [])

    if (!isClient) {
        return null;
    }

    const sections = [
        {
            title: "Job Listings",
            description: "Browse and search for job openings.",
            href: "/seeker/jobs",
            icon: <Briefcase className="h-8 w-8 text-primary" />,
        },
        {
            title: "My Applications",
            description: "Track the status of your submitted applications.",
            href: "/seeker/my-applications",
            icon: <FileCheck2 className="h-8 w-8 text-primary" />,
        },
        {
            title: "Resume Improver",
            description: "Get AI-powered feedback to improve your resume.",
            href: "/seeker/improve-resume",
            icon: <FileUp className="h-8 w-8 text-primary" />,
        },
        {
            title: "Account Settings",
            description: "Manage your profile and account details.",
            href: "/seeker/account",
            icon: <Settings className="h-8 w-8 text-primary" />,
        }
    ]

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome back, {userName || 'Job Seeker'}!</CardTitle>
                    <CardDescription>Here's your dashboard. Everything you need to land your next job is right here.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section) => (
                    <Link href={section.href} key={section.title}>
                        <Card className="flex h-full flex-col p-6 text-left transition-transform duration-300 hover:scale-105 hover:shadow-xl active:scale-100 active:shadow-lg">
                            <CardHeader className="p-0 flex-row items-center gap-4">
                                {section.icon}
                                <CardTitle>{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 mt-4">
                                <p className="text-muted-foreground">{section.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
