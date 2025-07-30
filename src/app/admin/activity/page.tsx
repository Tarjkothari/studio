
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type User = { name: string; email: string; role: string; fallback: string, avatar: string, createdAt?: string };
type JobPosting = { id: string; title: string; postedBy: string; createdAt: string; company: string; };
type Application = { jobId: string; applicantEmail: string; appliedDate: string; status: string; };

type ActivityEvent = {
    date: Date;
    type: 'User Registered' | 'Job Posted' | 'Applied for Job' | 'Selected for Test';
    description: string;
    user: User;
    details?: string;
};

export default function ActivityPage() {
    const [activity, setActivity] = useState<ActivityEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        try {
            const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
            const jobs: JobPosting[] = JSON.parse(localStorage.getItem('jobPostings') || '[]');
            const applications: Application[] = JSON.parse(localStorage.getItem('jobApplications') || '[]');

            const userMap = new Map(users.map(u => [u.email, u]));
            const jobMap = new Map(jobs.map(j => [j.id, j]));
            
            let allActivities: ActivityEvent[] = [];

            // User Registrations
            users.forEach(user => {
                allActivities.push({
                    date: new Date(user.createdAt || new Date()), // Fallback for older data
                    type: 'User Registered',
                    description: `${user.name} (${user.role})`,
                    user: user,
                });
            });

            // Job Postings
            jobs.forEach(job => {
                const provider = userMap.get(job.postedBy);
                if (provider) {
                    allActivities.push({
                        date: new Date(job.createdAt || new Date()),
                        type: 'Job Posted',
                        description: `"${job.title}" by ${job.company}`,
                        user: provider,
                    });
                }
            });

            // Applications
            applications.forEach(app => {
                const applicant = userMap.get(app.applicantEmail);
                const job = jobMap.get(app.jobId);
                if (applicant && job) {
                     allActivities.push({
                        date: new Date(app.appliedDate),
                        type: 'Applied for Job',
                        description: `${applicant.name} applied for "${job.title}"`,
                        user: applicant,
                        details: `at ${job.company}`
                    });

                    if(app.status === 'Selected for Test') {
                        const provider = userMap.get(job.postedBy);
                         if (provider) {
                            allActivities.push({
                                date: new Date(app.appliedDate), // Note: we don't store selection date, so using applied date
                                type: 'Selected for Test',
                                description: `${applicant.name} was selected for test by ${provider.name}`,
                                user: provider,
                                details: `for job "${job.title}"`
                            });
                         }
                    }
                }
            });

            allActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
            
            setActivity(allActivities);

        } catch (e) {
            console.error("Failed to load activity data from localStorage", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getTypeBadge = (type: ActivityEvent['type']) => {
        switch(type) {
            case 'User Registered': return <Badge variant="outline">Registration</Badge>;
            case 'Job Posted': return <Badge variant="secondary">Job Posting</Badge>;
            case 'Applied for Job': return <Badge variant="default">Application</Badge>;
            case 'Selected for Test': return <Badge variant="default" className="bg-green-600">Selection</Badge>;
        }
    }


    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <Card className="transition-all hover:shadow-lg">
            <CardHeader>
                <CardTitle>Platform Activity</CardTitle>
                <CardDescription>A chronological log of all important events happening in the application.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Event Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>User Involved</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activity.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No activity yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            activity.map((event, index) => (
                                <TableRow key={index}>
                                    <TableCell>{getTypeBadge(event.type)}</TableCell>
                                    <TableCell>
                                        <p className="font-medium">{event.description}</p>
                                        {event.details && <p className="text-sm text-muted-foreground">{event.details}</p>}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={event.user.avatar} data-ai-hint="avatar" />
                                                <AvatarFallback>{event.user.fallback}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{event.user.name}</p>
                                                <p className="text-xs text-muted-foreground">{event.user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {event.date.toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
