
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Briefcase, MapPin, Users, PlusCircle } from 'lucide-react';
import Link from 'next/link';

type JobPosting = {
    id: string;
    title: string;
    company: string;
    location: string;
    postedBy: string;
};

type Application = {
    jobId: string;
}

export default function MyJobsPage() {
    const [myJobs, setMyJobs] = useState<JobPosting[]>([]);
    const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const userString = localStorage.getItem('loggedInUser');
            if (userString) {
                const user = JSON.parse(userString);
                setCurrentUserEmail(user.email);
            }
        } catch (e) {
            console.error("Failed to load user from local storage", e);
        }
    }, []);

    useEffect(() => {
        if (!currentUserEmail) {
            // Wait for the user's email to be loaded
            if (!isLoading && myJobs.length === 0) {
                 // only stop loading if we are sure there are no jobs
            } else if (isLoading && !currentUserEmail) {
                return;
            }
        }
        
        setIsLoading(true);

        try {
            const allJobs = JSON.parse(localStorage.getItem('jobPostings') || '[]');
            const allApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');

            const counts: Record<string, number> = {};
            for (const app of allApplications) {
                counts[app.jobId] = (counts[app.jobId] || 0) + 1;
            }
            
            if (currentUserEmail) {
                const filteredJobs = allJobs.filter((job: JobPosting) => job.postedBy === currentUserEmail);
                setMyJobs(filteredJobs.reverse());
            }

            setApplicationCounts(counts);

        } catch (e) {
            console.error("Failed to load data from local storage", e);
        } finally {
            setIsLoading(false);
        }
    }, [currentUserEmail]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>My Job Postings</CardTitle>
                        <CardDescription>Manage your posted jobs and view applicants.</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/post-job">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Post a New Job
                        </Link>
                    </Button>
                </CardHeader>
            </Card>

             {isLoading ? (
                 <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        Loading your jobs...
                    </CardContent>
                </Card>
             ) : myJobs.length === 0 ? (
                <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        You haven't posted any jobs yet.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {myJobs.map((job) => (
                        <Card key={job.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{job.title}</CardTitle>
                                <CardDescription className="space-y-2 pt-2">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                        <span>{job.company}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{job.location}</span>
                                    </div>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>
                                        {applicationCounts[job.id] || 0} applicant(s)
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/dashboard/my-jobs/${job.id}/applicants`}>
                                        <Users className="mr-2 h-4 w-4" />
                                        View Applicants
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
