"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { parseResume } from "@/ai/flows/parse-resume";
import { rankCandidates, RankCandidatesOutput } from "@/ai/flows/rank-candidates";
import { Loader2, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type ResumeFile = {
  name: string;
  dataUri: string;
};

export default function RankerPage() {
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFiles, setResumeFiles] = useState<ResumeFile[]>([]);
  const [results, setResults] = useState<RankCandidatesOutput>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray: Promise<ResumeFile>[] = Array.from(files).map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({ name: file.name, dataUri: e.target?.result as string });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileArray)
      .then(setResumeFiles)
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error reading files",
          description: "There was an issue processing your uploaded files.",
        });
      });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!jobDescription || resumeFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a job description and at least one resume.",
      });
      return;
    }

    setIsLoading(true);
    setResults([]);
    setProgress(0);

    try {
      const parsedResumes = await Promise.all(
        resumeFiles.map(async (file, index) => {
          try {
            const parsed = await parseResume({ resumeDataUri: file.dataUri });
            setProgress((prev) => prev + (50 / resumeFiles.length)); // Parsing is 50% of the work
            
            // Synthesize text from parsed data
            const experienceText = parsed.experience.map(p => `Title: ${p.title} at ${p.company} (${p.dates}). Description: ${p.description}`).join('\\n');
            const educationText = parsed.education.map(e => `${e.degree} at ${e.institution} (${e.dates})`).join('\\n');
            const skillsText = parsed.skills.join(', ');
            return `Resume File: ${file.name}\\n\\nSKILLS: ${skillsText}\\n\\nEXPERIENCE:\\n${experienceText}\\n\\nEDUCATION:\\n${educationText}`;
          } catch (error) {
             console.error(`Error parsing ${file.name}:`, error);
             toast({ variant: "destructive", title: `Failed to parse ${file.name}` });
             return `Could not parse resume: ${file.name}`;
          }
        })
      );
      
      setProgress(50);
      const rankingResults = await rankCandidates({ jobDescription, resumes: parsedResumes });
      setResults(rankingResults.sort((a, b) => b.score - a.score));
      setProgress(100);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Ranking Failed",
        description: "An error occurred while ranking candidates.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Candidate Ranker</CardTitle>
          <CardDescription>
            Paste a job description and upload resumes to rank candidates based on relevance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="job-description">Job Description</Label>
              <Textarea
                id="job-description"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resumes">Resumes (PDF)</Label>
              <Input
                id="resumes"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                required
              />
               {resumeFiles.length > 0 && (
                <p className="text-sm text-muted-foreground pt-2">
                  {resumeFiles.length} file(s) selected.
                </p>
              )}
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ranking...
                </>
              ) : (
                "Rank Candidates"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
         <Card>
            <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h3 className="text-xl font-semibold">AI is at work</h3>
                    <p className="text-muted-foreground">Parsing resumes and calculating scores. Please wait.</p>
                    <Progress value={progress} className="w-full max-w-sm" />
                </div>
            </CardContent>
         </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ranking Results</CardTitle>
            <CardDescription>Top candidates based on your job description.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <Card key={index} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                       <CardTitle className="text-lg">
                        {result.resume.split('\\n')[0].replace('Resume File: ', '')}
                      </CardTitle>
                      <Badge variant={result.score > 80 ? "default" : result.score > 60 ? "secondary" : "destructive"} className="flex gap-1.5 py-1.5 px-3 text-base">
                        <Star className="h-4 w-4" />
                        <span>{result.score}/100</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground italic">
                      "{result.justification}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
