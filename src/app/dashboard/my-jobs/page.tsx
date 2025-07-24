
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Briefcase, MapPin, Users, PlusCircle, Calendar, Pencil, Loader2, Star, Download, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { rankCandidates } from '@/ai/flows/rank-candidates';
import { parseResume } from '@/ai/flows/parse-resume';

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
    applicantEmail: string;
    applicantName: string;
    resumeDataUri: string;
    achievements: string;
    appliedDate: string;
    status: 'Applied' | 'Selected for Test' | 'Not Selected';
};

type RankedApplication = Application & {
    score?: number;
    justification?: string;
};

type JobWithApplicants = JobPosting & {
    applicants: RankedApplication[];
};

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
    const { toast } = useToast();
    const [myJobs, setMyJobs] = useState<JobWithApplicants[]>([]);
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
            if (!isLoading && !currentUserEmail) setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            let allJobs = JSON.parse(localStorage.getItem('jobPostings') || '[]') as JobPosting[];
            const allApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]') as Application[];
            
            // Add default jobs if they don't exist for the default provider
            if (currentUserEmail === 'provider@example.com') {
                const existingDefaultJobIds = new Set(allJobs.map((j: JobPosting) => j.id));
                const jobsToAdd = defaultJobs.filter(dj => !existingDefaultJobIds.has(dj.id));
                if (jobsToAdd.length > 0) {
                    allJobs = [...allJobs, ...jobsToAdd];
                    localStorage.setItem('jobPostings', JSON.stringify(allJobs));
                }
            }

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
    }, [currentUserEmail, pathname]);

    const handleSelectForTest = (jobId: string, applicantEmail: string) => {
        try {
            const allApplications: Application[] = JSON.parse(localStorage.getItem('jobApplications') || '[]');
            const appIndex = allApplications.findIndex(app => app.jobId === jobId && app.applicantEmail === applicantEmail);

            if (appIndex !== -1) {
                allApplications[appIndex].status = 'Selected for Test';
                localStorage.setItem('jobApplications', JSON.stringify(allApplications));

                // Update local state to reflect the change immediately
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
            }
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update candidate status.' });
            console.error(e);
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
            newJobs[jobIndex].applicants[applicantIndex].score = -1; // Loading state
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
                <div className="space-y-6">
                    {myJobs.map((job) => (
                        <Collapsible key={job.id} asChild>
                            <Card className="flex flex-col">
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
                                                        <TableRow key={applicant.applicantEmail}>
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
                                                                {applicant.status === 'Selected for Test' ? (
                                                                    <Button variant="ghost" disabled size="sm" className="text-green-500">
                                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                                        Selected
                                                                    </Button>
                                                                ) : (
                                                                    <Button variant="secondary" size="sm" onClick={() => handleSelectForTest(job.id, applicant.applicantEmail)}>
                                                                        Select for Test
                                                                    </Button>
                                                                )}
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

    