
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Briefcase, MapPin, Users, PlusCircle, Calendar, Pencil, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type JobPosting = {
    id: string;
    title: string;
    company: string;
    location: string;
    postedBy: string;
    description: string;
    deadline?: string;
};

type Application = {
    jobId: string;
}

const defaultJobs: JobPosting[] = [
    {
        id: '1',
        title: 'Senior Frontend Developer',
        company: 'Tech Solutions Inc.',
        location: 'Remote',
        postedBy: 'provider@example.com',
        description: 'We are looking for an experienced frontend developer to join our team. You will be responsible for building and maintaining our web applications.',
        deadline: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    },
    {
        id: '2',
        title: 'UX/UI Designer',
        company: 'Creative Minds LLC',
        location: 'New York, NY',
        postedBy: 'provider@example.com',
        description: 'Creative Minds is seeking a talented UX/UI designer to create amazing user experiences. The ideal candidate should have an eye for clean and artful design.',
        deadline: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
    },
    {
        id: '3',
        title: 'Backend Engineer (Go)',
        company: 'ScaleFast',
        location: 'San Francisco, CA',
        postedBy: 'provider@example.com',
        description: 'Join our backend team to build scalable and reliable services. We are looking for a Go developer with experience in microservices architecture.',
        deadline: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString(),
    }
];

export default function MyJobsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const [myJobs, setMyJobs] = useState<JobPosting[]>([]);
    const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        try {
            const userString = localStorage.getItem('loggedInUser');
            if (userString) {
                const user = JSON.parse(userString);
                setCurrentUserEmail(user.email);

                // Add default user if not exists for testing
                const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
                const providerExists = allUsers.some((u: any) => u.email === 'provider@example.com');
                if (!providerExists) {
                    allUsers.push({
                        name: "Default Provider",
                        email: "provider@example.com",
                        password: "password",
                        role: "Job Provider",
                        avatar: "https://placehold.co/40x40",
                        fallback: "DP",
                        status: "Active",
                    });
                    localStorage.setItem('users', JSON.stringify(allUsers));
                }
            }
        } catch (e) {
            console.error("Failed to load user from local storage", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!currentUserEmail) {
            return;
        }
        
        setIsLoading(true);

        try {
            const allJobsString = localStorage.getItem('jobPostings');
            let allJobs = allJobsString ? JSON.parse(allJobsString) : [];

            // Add default jobs if they don't exist for the default provider
            if (currentUserEmail === 'provider@example.com') {
                const existingDefaultJobIds = new Set(allJobs.map((j: JobPosting) => j.id));
                const jobsToAdd = defaultJobs.filter(dj => !existingDefaultJobIds.has(dj.id));
                if (jobsToAdd.length > 0) {
                    allJobs = [...allJobs, ...jobsToAdd];
                    localStorage.setItem('jobPostings', JSON.stringify(allJobs));
                }
            }
            
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
    }, [currentUserEmail, pathname]);

    const handleViewApplicantsClick = (job: JobPosting) => {
        router.push(`/dashboard/my-jobs/${job.id}/applicants`);
    };

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
                    <CardContent className="p-6 text-center flex justify-center items-center">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading your jobs...
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
                                     {job.deadline && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                                        </div>
                                    )}
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
                            <CardFooter className="flex gap-2">
                                <Button onClick={() => handleViewApplicantsClick(job)} className="w-full">
                                    <Users className="mr-2 h-4 w-4" />
                                    View Applicants
                                </Button>
                                <Button variant="outline" size="icon" asChild>
                                    <Link href={`/dashboard/my-jobs/${job.id}/edit`}>
                                        <Pencil className="h-4 w-4" />
                                        <span className="sr-only">Edit Job</span>
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
