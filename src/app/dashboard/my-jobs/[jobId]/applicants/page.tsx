
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { rankCandidates } from '@/ai/flows/rank-candidates';
import { parseResume } from '@/ai/flows/parse-resume';
import { Loader2, Star, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Application = {
    jobId: string;
    applicantEmail: string;
    applicantName: string;
    resumeDataUri: string;
    achievements: string;
    appliedDate: string;
};

type JobPosting = {
    id: string;
    title: string;
    description: string;
};

type RankedApplication = Application & {
    score?: number;
    justification?: string;
};

export default function ApplicantsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const jobId = params.jobId as string;

    const [job, setJob] = useState<JobPosting | null>(null);
    const [applicants, setApplicants] = useState<RankedApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (jobId) {
            try {
                const allJobsString = localStorage.getItem('jobPostings');
                if (allJobsString) {
                    const allJobs = JSON.parse(allJobsString) as JobPosting[];
                    const currentJob = allJobs.find((j) => j.id === jobId);
                    if (currentJob) {
                        setJob(currentJob);
                    } else {
                        toast({ variant: 'destructive', title: 'Error', description: 'Job not found.' });
                        router.push('/dashboard/my-jobs');
                    }
                }
            } catch (e) {
                console.error('Failed to load job data', e);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load job data.' });
            }
        }
    }, [jobId, router, toast]);
    
    useEffect(() => {
        if (job) {
            try {
                const allApplicationsString = localStorage.getItem('jobApplications');
                const allApplications = allApplicationsString ? JSON.parse(allApplicationsString) as Application[] : [];
                const jobApplicants = allApplications.filter((app) => app.jobId === job.id);
                setApplicants(jobApplicants);
            } catch (e) {
                console.error('Failed to load applicants data', e);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load applicants data.' });
            } finally {
                setIsLoading(false);
            }
        } else if (jobId) {
             setIsLoading(true);
        }
    }, [job, jobId, toast]);

    const handleRankApplicant = async (applicantEmail: string) => {
        const applicantIndex = applicants.findIndex(a => a.applicantEmail === applicantEmail);
        if (applicantIndex === -1 || !job) return;

        const applicant = applicants[applicantIndex];

        setApplicants(prev => {
            const newApplicants = [...prev];
            newApplicants[applicantIndex].score = -1; // Use -1 to signify loading
            return newApplicants;
        });

        try {
            const parsed = await parseResume({ resumeDataUri: applicant.resumeDataUri });
            const experienceText = parsed.experience.map(p => `Title: ${p.title} at ${p.company} (${p.dates}). Description: ${p.description}`).join('\\n');
            const educationText = parsed.education.map(e => `${e.degree} at ${e.institution} (${e.dates})`).join('\\n');
            const skillsText = parsed.skills.join(', ');
            const resumeText = `SKILLS: ${skillsText}\\n\\nEXPERIENCE:\\n${experienceText}\\n\\nEDUCATION:\\n${educationText}\\n\\nACHIEVEMENTS:\\n${applicant.achievements}`;

            const rankingResults = await rankCandidates({ jobDescription: job.description, resumes: [resumeText] });

            if (rankingResults && rankingResults.length > 0) {
                const { score, justification } = rankingResults[0];
                setApplicants(prev => {
                    const newApplicants = [...prev];
                    newApplicants[applicantIndex] = { ...newApplicants[applicantIndex], score, justification };
                    return newApplicants.sort((a,b) => (b.score ?? -1) - (a.score ?? -1));
                });
            }
        } catch (error) {
            console.error('Ranking failed', error);
            toast({ variant: 'destructive', title: 'AI Ranking Failed' });
            setApplicants(prev => {
                const newApplicants = [...prev];
                newApplicants[applicantIndex].score = undefined;
                return newApplicants;
            });
        }
    };
    
    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Applicants for {job?.title}</CardTitle>
                    <CardDescription>Review, rank, and manage candidates who have applied for this position.</CardDescription>
                </CardHeader>
                <CardContent>
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
                            {applicants.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                        No applicants yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                applicants.map((applicant) => (
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
                                                <Button variant="outline" size="sm" onClick={() => handleRankApplicant(applicant.applicantEmail)}>
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
                                        <TableCell className="text-right">
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
            </Card>
            <div className="text-center mt-4">
              <Button variant="outline" onClick={() => router.push('/dashboard/my-jobs')}>
                Back to My Jobs
              </Button>
            </div>
        </div>
    );
}
