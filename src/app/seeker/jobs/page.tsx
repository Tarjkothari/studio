
"use client";

import { useState, useEffect } from "react";
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
import { Briefcase, MapPin, Loader2, Upload, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type JobPosting = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
};

export default function JobSearchPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // State for the new "View Details" dialog
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingJob, setViewingJob] = useState<JobPosting | null>(null);


  useEffect(() => {
    try {
      const storedJobs = JSON.parse(localStorage.getItem("jobPostings") || "[]");
      setJobs(storedJobs);
    } catch (e) {
      console.error("Could not retrieve jobs from localStorage", e);
      setJobs([]);
    }
  }, []);

  const handleApplyClick = (job: JobPosting) => {
    setSelectedJob(job);
    setResumeFile(null); // Reset file input
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
        sessionStorage.setItem('jobDescriptionForImprover', selectedJob.description);
        sessionStorage.setItem('resumeForImprover', resumeDataUri);
        router.push('/seeker/improve-resume');
        setIsProcessing(false);
        setIsApplyDialogOpen(false);
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

  return (
    <>
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Your Next Opportunity</CardTitle>
          <CardDescription>
            Browse the latest job openings from top companies.
          </CardDescription>
        </CardHeader>
      </Card>

      {jobs.length === 0 ? (
        <Card>
            <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No job openings have been posted yet. Check back soon!</p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
                <Card key={job.id} className="flex flex-col">
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
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="line-clamp-4 text-sm text-muted-foreground">{job.description}</p>
                    </CardContent>
                    <CardFooter className="flex-col items-stretch gap-2 sm:flex-row">
                        <Button variant="outline" onClick={() => handleViewDetailsClick(job)} className="w-full">
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                        </Button>
                        <Button onClick={() => handleApplyClick(job)} className="w-full">
                            Apply Now
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      )}
    </div>
     <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Upload your resume to get AI-powered suggestions before finalizing your application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resume-upload">Upload Resume (PDF)</Label>
               <div className="flex items-center gap-2">
                  <Input id="resume-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                  <Button asChild variant="outline">
                      <Label htmlFor="resume-upload" className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Choose File
                      </Label>
                  </Button>
                  {resumeFile && <p className="text-sm text-muted-foreground">{resumeFile.name}</p>}
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmApplication} disabled={!resumeFile || isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze & Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{viewingJob?.title}</DialogTitle>
                    <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4"/>
                            <span>{viewingJob?.company}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4"/>
                            <span>{viewingJob?.location}</span>
                        </div>
                    </div>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="prose prose-sm dark:prose-invert text-sm text-muted-foreground whitespace-pre-wrap">
                        {viewingJob?.description}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                    <Button onClick={() => {
                        setIsViewDialogOpen(false);
                        if (viewingJob) {
                           handleApplyClick(viewingJob);
                        }
                    }}>
                        Apply Now
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
