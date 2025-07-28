
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Calendar as CalendarIcon, Wand2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { generateAptitudeTest } from "@/ai/flows/generate-aptitude-test";


export default function PostJobPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [criteria, setCriteria] = useState("");
  const [minimumMarks, setMinimumMarks] = useState("");
  const [minimumDegree, setMinimumDegree] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [deadline, setDeadline] = useState<Date>();
  const [generateTest, setGenerateTest] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Get the job provider's name from localStorage
    try {
        const loggedInUserString = localStorage.getItem("loggedInUser");
        if (loggedInUserString) {
            const loggedInUser = JSON.parse(loggedInUserString);
            setCompanyName(loggedInUser.name);
        }
    } catch(e) {
        console.error("Failed to load user from local storage", e)
    }
  }, [])

  const handlePostJob = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    if (!jobTitle || !location || !jobDescription || !criteria) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all fields.",
      });
      setIsSaving(false);
      return;
    }

    try {
        const newJob = {
            id: new Date().toISOString(),
            title: jobTitle,
            company: companyName,
            location: location,
            description: jobDescription,
            criteria: criteria,
            minimumMarks: minimumMarks,
            minimumDegree: minimumDegree,
            deadline: deadline ? deadline.toISOString() : null,
            postedBy: JSON.parse(localStorage.getItem("loggedInUser") || "{}").email
        };

        if (generateTest) {
            toast({ title: "Generating Aptitude Test...", description: "This may take a moment. Please don't navigate away." });
            const testResult = await generateAptitudeTest({ jobTitle });
            localStorage.setItem(`test_${newJob.id}`, JSON.stringify(testResult.questions));
        }

        const existingJobs = JSON.parse(localStorage.getItem('jobPostings') || '[]');
        const updatedJobs = [...existingJobs, newJob];
        localStorage.setItem('jobPostings', JSON.stringify(updatedJobs));

        toast({
            title: "Job Posted Successfully",
            description: "Your job opening is now live for seekers to view.",
        });

        router.push("/dashboard/my-jobs"); 

    } catch (e) {
      console.error("Failed to save job posting", e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save your job posting. If test generation was enabled, it may have failed.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post a New Job Opening</CardTitle>
        <CardDescription>
          Fill out the details below to create a new job listing.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handlePostJob}>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title</Label>
            <Input
              id="job-title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              required
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., San Francisco, CA or Remote"
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
              placeholder="Describe the role, responsibilities, and qualifications..."
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
              placeholder="List key criteria for the ideal candidate (e.g., 5+ years of React experience, Bachelor's degree in CS)..."
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
              placeholder="e.g., 75% or 8.0 CGPA"
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
            <div className="space-y-2 flex flex-row items-center justify-between rounded-lg border p-4 md:col-span-2">
                <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2" htmlFor="generate-test">
                        <Wand2 className="h-5 w-5 text-primary"/>
                        Generate Aptitude Test
                    </Label>
                    <CardDescription>
                       Automatically create a 50-question aptitude test for this role.
                    </CardDescription>
                </div>
                <Switch
                    id="generate-test"
                    checked={generateTest}
                    onCheckedChange={setGenerateTest}
                />
            </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Post Job
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
