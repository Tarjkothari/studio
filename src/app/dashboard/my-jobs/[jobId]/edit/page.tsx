
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Calendar as CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type JobPosting = {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    criteria: string;
    minimumMarks: string;
    minimumDegree: string;
    deadline?: string | null;
    postedBy: string;
};

export default function EditJobPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<JobPosting | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [criteria, setCriteria] = useState("");
  const [minimumMarks, setMinimumMarks] = useState("");
  const [minimumDegree, setMinimumDegree] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!jobId) {
        return;
    }
    
    setIsLoading(true);

    try {
      const existingJobs: JobPosting[] = JSON.parse(localStorage.getItem('jobPostings') || '[]');
      const jobToEdit = existingJobs.find(j => j.id === jobId);
      if (jobToEdit) {
        setJob(jobToEdit);
        setJobTitle(jobToEdit.title);
        setLocation(jobToEdit.location);
        setJobDescription(jobToEdit.description);
        setCriteria(jobToEdit.criteria);
        setMinimumMarks(jobToEdit.minimumMarks);
        setMinimumDegree(jobToEdit.minimumDegree);
        if (jobToEdit.deadline) {
            setDeadline(new Date(jobToEdit.deadline));
        }
      } else {
        toast({ variant: 'destructive', title: 'Job not found.' });
        router.push('/dashboard/my-jobs');
        return;
      }
    } catch (e) {
      console.error("Failed to load job", e);
      toast({ variant: 'destructive', title: 'Error loading job data.' });
    } finally {
        setIsLoading(false);
    }
  }, [jobId, router, toast]);

  const handleUpdateJob = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    if (!job) {
        toast({ variant: 'destructive', title: 'Cannot update job.' });
        setIsSaving(false);
        return;
    }

    try {
        const updatedJob: JobPosting = {
            ...job,
            title: jobTitle,
            location: location,
            description: jobDescription,
            criteria: criteria,
            minimumMarks: minimumMarks,
            minimumDegree: minimumDegree,
            deadline: deadline ? deadline.toISOString() : null,
        };

        const existingJobs: JobPosting[] = JSON.parse(localStorage.getItem('jobPostings') || '[]');
        const updatedJobs = existingJobs.map(j => (j.id === jobId ? updatedJob : j));
        localStorage.setItem('jobPostings', JSON.stringify(updatedJobs));

        toast({
            title: "Job Updated Successfully",
            description: "Your job opening has been updated.",
        });

        router.push("/dashboard/my-jobs"); 

    } catch (e) {
      console.error("Failed to update job posting", e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update your job posting.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !job) {
    return (
        <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Job Opening</CardTitle>
        <CardDescription>
          Update the details for your job listing below.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleUpdateJob}>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title</Label>
            <Input
              id="job-title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="job-description">Job Description</Label>
            <Textarea
              id="job-description"
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
            />
          </div>
           <div className="space-y-2 md:col-span-2">
            <Label htmlFor="criteria">Key Criteria</Label>
            <Textarea
              id="criteria"
              rows={4}
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              required
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="minimum-degree">Minimum Degree</Label>
            <Select value={minimumDegree} onValueChange={setMinimumDegree}>
                <SelectTrigger id="minimum-degree">
                    <SelectValue placeholder="Select a minimum degree" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Not Required">Not Required</SelectItem>
                    <SelectItem value="10th">10th</SelectItem>
                    <SelectItem value="12th">12th</SelectItem>
                    <SelectItem value="Diploma">Diploma</SelectItem>
                    <SelectItem value="Associate's Degree">Associate's Degree</SelectItem>
                    <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                    <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                    <SelectItem value="Doctorate">Doctorate (Ph.D.)</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="minimum-marks">Minimum Academic Marks</Label>
            <Input
              id="minimum-marks"
              value={minimumMarks}
              onChange={(e) => setMinimumMarks(e.target.value)}
            />
          </div>
           <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !deadline && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={deadline}
                            onSelect={setDeadline}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
