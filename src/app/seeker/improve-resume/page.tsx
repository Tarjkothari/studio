
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { suggestResumeImprovements, SuggestResumeImprovementsOutput } from "@/ai/flows/suggest-resume-improvements";
import { Loader2, Lightbulb, ThumbsUp, ThumbsDown, Upload } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { parseResume } from "@/ai/flows/parse-resume";
import { Label } from "@/components/ui/label";

export default function ImproveResumePage() {
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [achievements, setAchievements] = useState("");
  const [results, setResults] = useState<SuggestResumeImprovementsOutput>([]);
  const [isLoading, setIsLoading] = useState(false);

  const parseAndSetResume = async (dataUri: string) => {
    try {
        setIsLoading(true);
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
        setIsLoading(false);
    }
  }

  useEffect(() => {
    // Check session storage for pre-filled data
    const prefilledJd = sessionStorage.getItem('jobDescriptionForImprover');
    if (prefilledJd) {
      setJobDescription(prefilledJd);
      toast({
        title: "Job Description Loaded",
        description: "The job description from the listing has been pre-filled for you."
      })
      sessionStorage.removeItem('jobDescriptionForImprover');
    }

    const prefilledResume = sessionStorage.getItem('resumeForImprover');
    if (prefilledResume) {
        parseAndSetResume(prefilledResume);
        sessionStorage.removeItem('resumeForImprover');
    }

    const prefilledAchievements = sessionStorage.getItem('achievementsForImprover');
    if(prefilledAchievements) {
        setAchievements(prefilledAchievements);
        sessionStorage.removeItem('achievementsForImprover');
    }
  }, []);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUri = e.target?.result as string;
      await parseAndSetResume(dataUri);
    };
    reader.readAsDataURL(file);
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
    setResults([]);

    try {
      const suggestions = await suggestResumeImprovements({ resumeText, jobDescription, achievements });
      setResults(suggestions);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Analysis Failed",
        description: "An error occurred while generating suggestions.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle>AI Resume Improver</CardTitle>
          <CardDescription>
            Get AI-powered suggestions to tailor your resume to a specific job.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="resume-file-upload">Upload Resume (PDF)</Label>
                        <div className="flex items-center gap-2">
                            <Input id="resume-file-upload" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                            <Button asChild variant="outline">
                                <Label htmlFor="resume-file-upload" className="cursor-pointer">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Choose File
                                </Label>
                            </Button>
                            <p className="text-xs text-muted-foreground">Or paste below.</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="resume-text">Your Resume Text</Label>
                        <Textarea
                        id="resume-text"
                        placeholder="Paste your resume text here..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        rows={15}
                        required
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="job-description">Job Description</Label>
                        <Textarea
                            id="job-description"
                            placeholder="Paste the job description here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            rows={10}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="achievements">Your Achievements (Optional)</Label>
                        <Textarea
                            id="achievements"
                            placeholder="Describe your key achievements, projects, or awards..."
                            value={achievements}
                            onChange={(e) => setAchievements(e.target.value)}
                            rows={8}
                        />
                    </div>
                </div>
            </div>
            <div className="mt-6">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Suggestions...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" /> Get Suggestions
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {isLoading && resumeText && jobDescription && (
        <Card className="transition-all hover:shadow-lg">
           <CardContent className="p-6">
               <div className="flex flex-col items-center justify-center gap-4 text-center">
                   <Loader2 className="h-12 w-12 animate-spin text-primary" />
                   <h3 className="text-xl font-semibold">AI is at work</h3>
                   <p className="text-muted-foreground">Generating personalized resume improvements...</p>
               </div>
           </CardContent>
        </Card>
     )}

      {results.length > 0 && (
        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle>Improvement Suggestions</CardTitle>
            <CardDescription>Here are some AI-powered tips to improve your resume.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {results.map((result, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-3 text-left">
                       {result.isValuable ? <ThumbsUp className="h-5 w-5 text-green-500 flex-shrink-0" /> : <ThumbsDown className="h-5 w-5 text-destructive flex-shrink-0" />}
                      <span className="flex-1">{result.suggestion}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">{result.reasoning}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
