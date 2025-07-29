
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Upload, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { parseResume } from "@/ai/flows/parse-resume";
import { Label } from "@/components/ui/label";
import { analyzeSkillGap, SkillGapAnalysisOutput } from "@/ai/flows/analyze-skill-gap";

export default function SkillGapAnalysisPage() {
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState<SkillGapAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const parseAndSetResume = async (dataUri: string) => {
    setIsParsing(true);
    try {
        const parsed = await parseResume({ resumeDataUri: dataUri });
        const experienceText = parsed.experience.map(p => `Title: ${p.title} at ${p.company} (${p.dates}). Description: ${p.description}`).join('\n');
        const educationText = parsed.education.map(e => `${e.degree} at ${e.institution} (${e.dates})`).join('\n');
        const skillsText = parsed.skills.join(', ');
        const synthesizedText = `SKILLS:\n${skillsText}\n\nEXPERIENCE:\n${experienceText}\n\nEDUCATION:\n${educationText}`;
        setResumeText(synthesizedText);
        toast({ title: "Resume Parsed", description: "Your resume has been loaded into the text field." });
    } catch (error) {
        toast({ variant: "destructive", title: "Failed to parse resume" });
    } finally {
        setIsParsing(false);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    reader.readAsDataURL(file);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUri = e.target?.result as string;
      await parseAndSetResume(dataUri);
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!resumeText || !jobDescription) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide your resume text and a job description.",
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const analysis = await analyzeSkillGap({ resumeText, jobDescription });
      setResults(analysis);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Analysis Failed",
        description: "An error occurred while analyzing the skill gap.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Skill Gap Analysis</CardTitle>
          <CardDescription>
            Discover how your skills match up against a job description and identify areas for growth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="resume-file-upload">Upload Your Resume (PDF)</Label>
                        <div className="flex items-center gap-2">
                            <Input id="resume-file-upload" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                            <Button asChild variant="outline">
                                <Label htmlFor="resume-file-upload" className="cursor-pointer">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose File
                                </Label>
                            </Button>
                            {isParsing && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="resume-text">Your Resume Text</Label>
                        <Textarea
                        id="resume-text"
                        placeholder="Upload a resume or paste the text here..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        rows={15}
                        required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="job-description">Job Description</Label>
                    <Textarea
                        id="job-description"
                        placeholder="Paste the target job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={18}
                        required
                    />
                </div>
            </div>
            <div className="mt-6">
              <Button type="submit" disabled={isLoading || isParsing}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" /> Analyze Skill Gap
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {isLoading && resumeText && jobDescription && (
        <Card>
           <CardContent className="p-6">
               <div className="flex flex-col items-center justify-center gap-4 text-center">
                   <Loader2 className="h-12 w-12 animate-spin text-primary" />
                   <h3 className="text-xl font-semibold">AI is analyzing your profile</h3>
                   <p className="text-muted-foreground">Comparing your skills against the job requirements.</p>
               </div>
           </CardContent>
        </Card>
     )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Skill Gap Analysis Results</CardTitle>
            <CardDescription>Here's a breakdown of your skills compared to the job requirements.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-500">Matching Skills</h3>
                <ul className="space-y-2">
                    {results.matchingSkills.map((skill, index) => (
                        <li key={`match-${index}`} className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>{skill}</span>
                        </li>
                    ))}
                </ul>
            </div>
             <div className="space-y-4">
                <h3 className="text-lg font-semibold text-destructive">Missing Skills</h3>
                 <ul className="space-y-2">
                    {results.missingSkills.map((skill, index) => (
                        <li key={`miss-${index}`} className="flex items-center gap-2">
                            <X className="h-5 w-5 text-destructive flex-shrink-0" />
                            <span>{skill}</span>
                        </li>
                    ))}
                </ul>
            </div>
             <div className="md:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold">Overall Summary</h3>
                <p className="text-sm text-muted-foreground">{results.summary}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
