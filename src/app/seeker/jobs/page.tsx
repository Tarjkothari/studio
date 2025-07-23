
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
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin } from "lucide-react";

type JobPosting = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
};

export default function JobSearchPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPosting[]>([]);

  useEffect(() => {
    try {
      const storedJobs = JSON.parse(localStorage.getItem("jobPostings") || "[]");
      setJobs(storedJobs);
    } catch (e) {
      console.error("Could not retrieve jobs from localStorage", e);
      setJobs([]);
    }
  }, []);

  const handleApply = (job: JobPosting) => {
    // Store the job description in session storage to pre-fill the improver page
    sessionStorage.setItem('jobDescriptionForImprover', job.description);
    router.push('/seeker/improve-resume');
  };

  return (
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
                    <CardFooter>
                        <Button onClick={() => handleApply(job)} className="w-full">
                            Apply Now
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
      )}
    </div>
  );
}
