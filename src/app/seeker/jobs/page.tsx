
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Briefcase, MapPin, Loader2, Upload, FileText, CheckCircle, Award, GraduationCap, Calendar, ListChecks, History } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type JobPosting = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  criteria?: string;
  minimumMarks?: string;
  minimumDegree?: string;
  deadline?: string;
  postedBy: string;
};

type Application = {
    jobId: string;
    applicantEmail: string;
    status: 'Applied' | 'Selected for Test' | 'Not Selected';
    resumeDataUri: string;
    achievements: string;
    appliedDate: string;
}

export default function JobSearchPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [openJobs, setOpenJobs] = useState<JobPosting[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<JobPosting[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [achievements, setAchievements] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingJob, setViewingJob] = useState<JobPosting | null>(null);

  const loadJobs = useCallback(() => {
    setIsLoading(true);
    try {
      const allJobsString = localStorage.getItem('jobPostings');
      let allJobs: JobPosting[] = allJobsString ? JSON.parse(allJobsString) : [];
      
      const now = new Date();
      const activeJobs = allJobs.filter(job => !job.deadline || new Date(job.deadline) >= now);

      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
      const allApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
      const userApplications = allApplications.filter((app: Application) => app.applicantEmail === loggedInUser.email);
      const userAppliedJobIds = new Set(userApplications.map((app: Application) => app.jobId));
      
      const openForApplication = activeJobs.filter(job => !userAppliedJobIds.has(job.id));
      const alreadyApplied = activeJobs.filter(job => userAppliedJobIds.has(job.id));

      setOpenJobs(openForApplication.reverse());
      setAppliedJobs(alreadyApplied.reverse());

    } catch (e) {
      console.error("Could not retrieve data from localStorage", e);
      setOpenJobs([]);
      setAppliedJobs([]);
    } finally {
        setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadJobs();
    
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'jobPostings' || event.key === 'jobApplications') {
            loadJobs();
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadJobs]);

  const handleApplyClick = (job: JobPosting) => {
    setSelectedJob(job);
    setResumeFile(null);
    setAchievements("");
    setIsApplyDialogOpen(true);
  };
  
  const handleViewDetailsClick = (job: JobPosting) => {
      setViewingJob(job);
      setIsViewDialogOpen(true);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleConfirmApplication = () => {
    if (!selectedJob || !resumeFile) {
        toast({
            variant: "destructive",
            title: "Missing Resume",
            description: "Please upload your resume to apply.",
        });
        return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
        const resumeDataUri = e.target?.result as string;

        try {
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
            
            const newApplication = {
                jobId: selectedJob.id,
                applicantEmail: loggedInUser.email,
                applicantName: loggedInUser.name,
                resumeDataUri: resumeDataUri,
                achievements: achievements,
                status: 'Applied', 
                appliedDate: new Date().toISOString(),
            };

            const allApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
            allApplications.push(newApplication);
            localStorage.setItem('jobApplications', JSON.stringify(allApplications));
            
            // Manually trigger storage event for the current tab
            window.dispatchEvent(new StorageEvent('storage', {key: 'jobApplications'}));

            toast({
              title: "Application Sent!",
              description: "Your application has been submitted successfully.",
            });
            
        } catch (error) {
            console.error("Failed to process application", error);
            toast({ variant: "destructive", title: "Application Failed", description: "Could not save your application." });
        } finally {
            setIsProcessing(false);
            setIsApplyDialogOpen(false);
        }

    };
    reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "Error Reading File",
            description: "There was an issue processing your resume.",
        });
        setIsProcessing(false);
    };
    reader.readAsDataURL(resumeFile);
  };

  const renderJobCard = (job: JobPosting, hasApplied: boolean) => {
    const isDeadlinePassed = job.deadline ? new Date(job.deadline) < new Date() : false;

    return (
        <Card key={job.id} className="flex flex-col transition-all hover:shadow-xl hover:border-primary/50">
            <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription className="space-y-2">
                   <div className="flex items-center gap-2 pt-2">
                     <Briefcase className="h-4 w-4 text-muted-foreground"/>
                     <span>{job.company}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <MapPin className="h-4 w-4 text-muted-foreground"/>
                     <span>{job.location}</span>
                   </div>
                   {job.deadline && (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className={isDeadlinePassed ? 'text-destructive' : ''}>
                                {new Date(job.deadline).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="line-clamp-4 text-sm text-muted-foreground">{job.description}</p>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-2 sm:flex-row">
                {hasApplied ? (
                     <Button disabled className="w-full">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Applied
                    </Button>
                ) : (
                    <>
                        <Button variant="outline" onClick={() => handleViewDetailsClick(job)} className="w-full">
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                        </Button>
                        <Button onClick={() => handleApplyClick(job)} className="w-full" disabled={isDeadlinePassed}>
                            Apply Now
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    );
  }

  return (
    <>
    <div className="space-y-8">
      <Card className="transition-shadow hover:shadow-lg">
        <CardHeader>
          <CardTitle>Find Your Next Opportunity</CardTitle>
          <CardDescription>
            Browse the latest job openings from top companies.
          </CardDescription>
        </CardHeader>
      </Card>

        {isLoading ? (
             <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        ) : openJobs.length === 0 && appliedJobs.length === 0 ? (
            <Card>
                <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">No job openings have been posted yet. Check back soon!</p>
                </CardContent>
            </Card>
        ) : (
            <>
                <div>
                     <div className="mb-4 flex items-center gap-3">
                        <ListChecks className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">Open for Application</h2>
                    </div>
                    {openJobs.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                           {openJobs.map((job) => renderJobCard(job, false))}
                        </div>
                    ) : (
                         <Card>
                            <CardContent className="p-6">
                                <p className="text-center text-muted-foreground">You have applied to all available jobs. Great work!</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {appliedJobs.length > 0 && (
                    <div>
                        <Separator className="my-8" />
                        <div className="mb-4 flex items-center gap-3">
                            <History className="h-6 w-6 text-primary" />
                            <h2 className="text-2xl font-bold">Applied Jobs</h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {appliedJobs.map((job) => renderJobCard(job, true))}
                        </div>
                    </div>
                )}
            </>
        )}
    </div>
     <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Upload your resume and describe your achievements to get AI-powered feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resume-upload">Upload Resume (PDF)</Label>
               <div className="flex items-center gap-2">
                  <Input id="resume-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} required />
                  <Button asChild variant="outline">
                      <Label htmlFor="resume-upload" className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Choose File
                      </Label>
                  </Button>
                  {resumeFile && <p className="text-sm text-muted-foreground">{resumeFile.name}</p>}
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="achievements">Your Achievements (Optional)</Label>
                <Textarea
                    id="achievements"
                    placeholder="Briefly describe your key achievements, projects, or awards..."
                    rows={5}
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmApplication} disabled={!resumeFile || isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{viewingJob?.title}</DialogTitle>
                    <div className="pt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4"/>
                                <span>{viewingJob?.company}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4"/>
                                <span>{viewingJob?.location}</span>
                            </div>
                             {viewingJob?.deadline && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Deadline: {new Date(viewingJob.deadline).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="prose prose-sm dark:prose-invert text-sm text-muted-foreground whitespace-pre-wrap space-y-4">
                       
                        {(viewingJob?.criteria || viewingJob?.minimumDegree || viewingJob?.minimumMarks) && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-foreground">Requirements</h3>
                                <div className="space-y-3">
                                {viewingJob?.criteria && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-foreground">Key Criteria</h4>
                                        <ul className="list-disc pl-5 space-y-1">
                                            {viewingJob.criteria.split('\\n').map((item, index) => item.trim() && (
                                                <li key={index}>
                                                   <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {(viewingJob?.minimumDegree || viewingJob?.minimumMarks) && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-foreground">Academic</h4>
                                        <ul className="list-none p-0 space-y-1">
                                            {viewingJob.minimumDegree && (
                                                 <li className="flex items-start gap-2">
                                                    <GraduationCap className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                                                    <span>{viewingJob.minimumDegree}</span>
                                                 </li>
                                            )}
                                             {viewingJob.minimumMarks && (
                                                 <li className="flex items-start gap-2">
                                                    <Award className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                                                    <span>Minimum Marks: <strong>{viewingJob.minimumMarks}</strong></span>
                                                 </li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                                </div>
                            </div>
                        )}

                       <Separator />
                        <div className="space-y-2">
                           <h3 className="text-base font-semibold text-foreground">Job Description</h3>
                           <p>{viewingJob?.description}</p>
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                    <Button onClick={() => {
                        setIsViewDialogOpen(false);
                        if (viewingJob) {
                           handleApplyClick(viewingJob);
                        }
                    }} disabled={viewingJob?.deadline ? new Date(viewingJob.deadline) < new Date() : false}>
                        Apply Now
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}

    