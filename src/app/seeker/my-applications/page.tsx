
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Application = {
    jobId: string;
    applicantEmail: string;
    appliedDate: string;
    status: 'Applied' | 'Selected for Test' | 'Test Completed' | 'Not Selected';
};

type JobPosting = {
  id: string;
  title: string;
  company: string;
};

type EnrichedApplication = Application & {
    jobTitle: string;
    companyName: string;
};

export default function MyApplicationsPage() {
    const [applications, setApplications] = useState<EnrichedApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        try {
            const loggedInUserString = localStorage.getItem('loggedInUser');
            if (!loggedInUserString) {
                setIsLoading(false);
                return;
            }
            const loggedInUser = JSON.parse(loggedInUserString);
            const userEmail = loggedInUser.email;

            const allApplications: Application[] = JSON.parse(localStorage.getItem('jobApplications') || '[]');
            const allJobs: JobPosting[] = JSON.parse(localStorage.getItem('jobPostings') || '[]');
            
            const jobMap = new Map(allJobs.map(job => [job.id, { title: job.title, company: job.company }]));
            
            const userApplications = allApplications.filter(app => app.applicantEmail === userEmail);
            
            const enrichedApplications = userApplications.map(app => {
                const jobDetails = jobMap.get(app.jobId);
                return {
                    ...app,
                    jobTitle: jobDetails?.title || 'Unknown Job',
                    companyName: jobDetails?.company || 'Unknown Company',
                };
            });

            setApplications(enrichedApplications.reverse());
        } catch (e) {
            console.error("Failed to load applications from localStorage", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getStatusComponent = (app: EnrichedApplication) => {
        switch (app.status) {
            case 'Applied':
                return <Badge variant="secondary">Applied</Badge>;
            case 'Selected for Test':
                return (
                    <Button asChild size="sm">
                        <Link href={`/seeker/test/${app.jobId}`}>
                           Start Test
                        </Link>
                    </Button>
                );
            case 'Test Completed':
                return <Badge variant='default' className="bg-green-600">Test Completed</Badge>;
            case 'Not Selected':
                return <Badge variant="destructive">Not Selected</Badge>;
            default:
                return <Badge variant="outline">{app.status || 'Applied'}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track the status of all your job applications.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Job Title</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Applied On</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                    You haven't applied to any jobs yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            applications.map((app) => (
                                <TableRow key={app.jobId + app.applicantEmail} className="transition-colors hover:bg-muted/50">
                                    <TableCell className="font-medium">{app.jobTitle}</TableCell>
                                    <TableCell>{app.companyName}</TableCell>
                                    <TableCell>{new Date(app.appliedDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {getStatusComponent(app)}
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
