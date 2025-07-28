
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Briefcase, MapPin, Users, PlusCircle, Calendar, Pencil, Loader2, Star, Download, Trophy, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { rankCandidates } from '@/ai/flows/rank-candidates';
import { parseResume } from '@/ai/flows/parse-resume';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


type JobPosting = {
    id: string;
    title: string;
    company: string;
    location: string;
    postedBy: string;
    description: string;
    deadline?: string;
    criteria?: string;
    minimumMarks?: string;
    minimumDegree?: string;
};

type Application = {
    jobId: string;
    applicantEmail: string;
    applicantName: string;
    resumeDataUri: string;
    achievements: string;
    appliedDate: string;
    status: 'Applied' | 'Selected for Test' | 'Test Completed' | 'Not Selected';
    testScore?: number;
};

type RankedApplication = Application & {
    score?: number;
    justification?: string;
};

type JobWithApplicants = JobPosting & {
    applicants: RankedApplication[];
};

export default function MyJobsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();
    const [myJobs, setMyJobs] = useState<JobWithApplicants[]>([]);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadJobsAndApplicants = () => {
         if (!currentUserEmail) {
            return;
        }
        setIsLoading(true);
        try {
            const allJobs = JSON.parse(localStorage.getItem('jobPostings') || '[]') as JobPosting[];
            const allApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]') as Application[];
            
            const jobsWithApplicants = allJobs
                .filter((job: JobPosting) => job.postedBy === currentUserEmail)
                .map(job => ({
                    ...job,
                    applicants: allApplications.filter(app => app.jobId === job.id),
                }));
            
            setMyJobs(jobsWithApplicants.reverse());

        } catch (e) {
            console.error("Failed to load data from local storage", e);
        } finally {
            setIsLoading(false);
        }
    }

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
        loadJobsAndApplicants();
        
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'jobPostings' || event.key === 'jobApplications' || event.key === null) {
                loadJobsAndApplicants();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserEmail, pathname]);

    const handleSelectForTest = (jobId: string, applicantEmail: string) => {
        try {
            const allApplications: Application[] = JSON.parse(localStorage.getItem('jobApplications') || '[]');
            const appIndex = allApplications.findIndex(app => app.jobId === jobId && app.applicantEmail === applicantEmail);

            if (appIndex !== -1) {
                allApplications[appIndex].status = 'Selected for Test';
                localStorage.setItem('jobApplications', JSON.stringify(allApplications));

                setMyJobs(prevJobs => {
                    return prevJobs.map(job => {
                        if (job.id === jobId) {
                            return {
                                ...job,
                                applicants: job.applicants.map(app => {
                                    if (app.applicantEmail === applicantEmail) {
                                        return { ...app, status: 'Selected for Test' };
                                    }
                                    return app;
                                })
                            };
                        }
                        return job;
                    });
                });
                toast({ title: "Candidate Selected", description: "The candidate has been selected for the aptitude test." });
                 window.dispatchEvent(new Event('storage'));
            }
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update candidate status.' });
            console.error(e);
        }
    };
    
    const handleDeleteJob = (jobId: string) => {
        try {
            let allJobs: JobPosting[] = JSON.parse(localStorage.getItem('jobPostings') || '[]');
            let allApplications: Application[] = JSON.parse(localStorage.getItem('jobApplications') || '[]');

            // Filter out the job to delete
            const updatedJobs = allJobs.filter(job => job.id !== jobId);
            const updatedApplications = allApplications.filter(app => app.jobId !== jobId);
            
            localStorage.setItem('jobPostings', JSON.stringify(updatedJobs));
            localStorage.setItem('jobApplications', JSON.stringify(updatedApplications));
            localStorage.removeItem(`test_${jobId}`); // Remove associated test

            setMyJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));

            toast({
                title: "Job Deleted",
                description: "The job posting has been successfully removed.",
            });
            window.dispatchEvent(new Event('storage'));
        } catch (e) {
            console.error("Failed to delete job", e);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not delete the job posting.",
            });
        }
    };

    const handleRankApplicant = async (jobId: string, applicantEmail: string) => {
        const jobIndex = myJobs.findIndex(j => j.id === jobId);
        if (jobIndex === -1) return;

        const applicantIndex = myJobs[jobIndex].applicants.findIndex(a => a.applicantEmail === applicantEmail);
        if (applicantIndex === -1) return;

        const applicant = myJobs[jobIndex].applicants[applicantIndex];
        const jobDescription = myJobs[jobIndex].description;

        setMyJobs(prev => {
            const newJobs = [...prev];
            newJobs[jobIndex].applicants[applicantIndex].score = -1; 
            return newJobs;
        });

        try {
            const parsed = await parseResume({ resumeDataUri: applicant.resumeDataUri });
            const experienceText = parsed.experience.map(p => `Title: ${p.title} at ${p.company} (${p.dates}). Description: ${p.description}`).join('\\n');
            const educationText = parsed.education.map(e => `${e.degree} at ${e.institution} (${e.dates})`).join('\\n');
            const skillsText = parsed.skills.join(', ');
            const resumeText = `SKILLS: ${skillsText}\\n\\nEXPERIENCE:\\n${experienceText}\\n\\nEDUCATION:\\n${educationText}\\n\\nACHIEVEMENTS:\\n${applicant.achievements}`;

            const rankingResults = await rankCandidates({ jobDescription, resumes: [resumeText] });

            if (rankingResults && rankingResults.length > 0) {
                const { score, justification } = rankingResults[0];
                setMyJobs(prev => {
                    const newJobs = [...prev];
                    const targetJob = newJobs[jobIndex];
                    const targetApplicant = targetJob.applicants[applicantIndex];
                    targetApplicant.score = score;
                    targetApplicant.justification = justification;
                    targetJob.applicants.sort((a,b) => (b.score ?? -1) - (a.score ?? -1));
                    return newJobs;
                });
            }
        } catch (error) {
            console.error('Ranking failed', error);
            toast({ variant: 'destructive', title: 'AI Ranking Failed' });
             setMyJobs(prev => {
                const newJobs = [...prev];
                newJobs[jobIndex].applicants[applicantIndex].score = undefined;
                return newJobs;
            });
        }
    };

    const getStatusComponent = (applicant: RankedApplication, jobId: string) => {
        switch(applicant.status) {
            case 'Applied':
                return (
                    <Button variant="secondary" size="sm" onClick={() => handleSelectForTest(jobId, applicant.applicantEmail)}>
                        Select for Test
                    </Button>
                );
            case 'Selected for Test':
                 return (
                    <Badge variant="default">
                        Test Pending
                    </Badge>
                );
            case 'Test Completed':
                return (
                    <div className="flex items-center gap-2">
                         <Badge variant="default" className="bg-green-600">
                           Test Completed
                         </Badge>
                         <div className="flex items-center gap-1 font-semibold">
                            <Trophy className="h-4 w-4 text-amber-400" />
                            <span>{applicant.testScore}/50</span>
                         </div>
                    </div>
                   
                );
            case 'Not Selected':
                return <Badge variant="destructive">Not Selected</Badge>;
            default:
                 return (
                    <Button variant="secondary" size="sm" onClick={() => handleSelectForTest(jobId, applicant.applicantEmail)}>
                        Select for Test
                    </Button>
                );
        }
    }


    return (
        <div className="space-y-6">
            <Card className="transition-shadow hover:shadow-lg">
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
                <div className="space-y-6">
                    {myJobs.map((job) => (
                        <Collapsible key={job.id} asChild>
                            <Card className="flex flex-col transition-shadow hover:shadow-lg">
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
                                <CardFooter className="flex gap-2">
                                    <CollapsibleTrigger asChild>
                                        <Button className="w-full">
                                            <Users className="mr-2 h-4 w-4" />
                                            View Applicants ({job.applicants.length})
                                        </Button>
                                    </CollapsibleTrigger>
                                    <Button variant="outline" size="icon" asChild>
                                        <Link href={`/dashboard/my-jobs/${job.id}/edit`}>
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">Edit Job</span>
                                        </Link>
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon">
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete Job</span>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure you want to delete this job?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the job posting and all associated applicant data.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteJob(job.id)}>
                                                    Continue
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardFooter>

                                <CollapsibleContent>
                                    <CardContent className="pt-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Applicant</TableHead>
                                                    <TableHead>Applied On</TableHead>
                                                    <TableHead className="text-center">AI Rank</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {job.applicants.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                            No applicants yet.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    job.applicants.map((applicant) => (
                                                        <TableRow key={applicant.applicantEmail} className="transition-colors hover:bg-muted/50">
                                                            <TableCell>
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar>
                                                                        <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="avatar" />
                                                                        <AvatarFallback>{applicant.applicantName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <p className="font-medium">{applicant.applicantName}</p>
                                                                        <p className="text-sm text-muted-foreground">{applicant.applicantEmail}</p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>{new Date(applicant.appliedDate).toLocaleDateString()}</TableCell>
                                                            <TableCell className="text-center">
                                                                {applicant.score === undefined ? (
                                                                    <Button variant="outline" size="sm" onClick={() => handleRankApplicant(job.id, applicant.applicantEmail)}>
                                                                        <Star className="mr-2 h-4 w-4" /> Rank
                                                                    </Button>
                                                                ) : applicant.score === -1 ? (
                                                                    <div className="flex items-center justify-center">
                                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex flex-col items-center">
                                                                        <Badge variant={applicant.score > 80 ? "default" : applicant.score > 60 ? "secondary" : "destructive"} className="flex gap-1.5 py-1 px-2 text-sm">
                                                                            <Star className="h-4 w-4" />
                                                                            <span>{applicant.score}/100</span>
                                                                        </Badge>
                                                                        <p className="text-xs text-muted-foreground italic mt-1 max-w-xs truncate" title={applicant.justification}>
                                                                            {applicant.justification}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right space-x-2">
                                                               {getStatusComponent(applicant, job.id)}
                                                                <Button variant="ghost" size="icon" asChild>
                                                                    <a href={applicant.resumeDataUri} download={`${applicant.applicantName}_Resume.pdf`}>
                                                                        <Download className="h-4 w-4" />
                                                                        <span className="sr-only">Download Resume</span>
                                                                    </a>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>
                    ))}
                </div>
            )}
        </div>
    );
}

    