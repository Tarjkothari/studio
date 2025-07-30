
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Upload, MessageSquare, Briefcase, User } from "lucide-react";
import { generateInterviewQuestions, InterviewQuestionsOutput } from "@/ai/flows/generate-interview-questions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { parseResume } from "@/ai/flows/parse-resume";


export default function InterviewQuestionGeneratorPage() {
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [results, setResults] = useState<InterviewQuestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUri = e.target?.result as string;
      try {
        const parsed = await parseResume({ resumeDataUri: dataUri });
        const experienceText = parsed.experience.map(p => `Title: ${p.title} at ${p.company} (${p.dates}). Description: ${p.description}`).join('\n');
        const educationText = parsed.education.map(e => `${e.degree} at ${e.institution} (${e.dates})`).join('\n');
        const skillsText = parsed.skills.join(', ');
        const synthesizedText = `SKILLS:\n${skillsText}\n\nEXPERIENCE:\n${experienceText}\n\nEDUCATION:\n${educationText}`;
        setResumeText(synthesizedText);
        toast({ title: "Resume Parsed", description: "The candidate's resume has been loaded." });
      } catch (error) {
        toast({ variant: "destructive", title: "Failed to parse resume" });
        setResumeText("");
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsDataURL(file);
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!jobDescription || !resumeText) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a job description and a resume.",
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const generatedQuestions = await generateInterviewQuestions({ jobDescription, resumeText });
      setResults(generatedQuestions);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Analysis Failed",
        description: "An error occurred while generating interview questions.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle>AI Interview Question Generator</CardTitle>
          <CardDescription>
            Generate tailored interview questions based on the job description and a candidate's resume.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <div className="space-y-2">
                         <Label htmlFor="job-description">Job Description</Label>
                        <Textarea
                            id="job-description"
                            placeholder="Paste the job description here..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            rows={15}
                            required
                        />
                    </div>
                </div>
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="resume-file-upload">Upload Candidate's Resume (PDF)</Label>
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
                        <Label htmlFor="resume-text">Candidate's Resume Text</Label>
                        <Textarea
                        id="resume-text"
                        placeholder="Upload a resume or paste the text here..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        rows={12}
                        required
                        />
                    </div>
                </div>
            </div>
            
            <Button type="submit" disabled={isLoading || isParsing}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" /> Generate Questions
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="transition-all hover:shadow-lg">
           <CardContent className="p-6">
               <div className="flex flex-col items-center justify-center gap-4 text-center">
                   <Loader2 className="h-12 w-12 animate-spin text-primary" />
                   <h3 className="text-xl font-semibold">AI is analyzing the profiles</h3>
                   <p className="text-muted-foreground">Crafting unique interview questions just for you.</p>
               </div>
           </CardContent>
        </Card>
     )}

      {results && (
        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle>Generated Interview Questions</CardTitle>
            <CardDescription>A set of questions tailored to the candidate and role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <Accordion type="multiple" className="w-full space-y-2">
                <AccordionItem value="technical">
                    <AccordionTrigger className="text-lg font-semibold bg-secondary/50 px-4 rounded-md">
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Technical Questions
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4">
                        <ul className="list-decimal list-inside space-y-2">
                            {results.technicalQuestions.map((q, i) => <li key={`tech-${i}`}>{q}</li>)}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="behavioral">
                    <AccordionTrigger className="text-lg font-semibold bg-secondary/50 px-4 rounded-md">
                         <div className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Behavioral Questions
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4">
                         <ul className="list-decimal list-inside space-y-2">
                            {results.behavioralQuestions.map((q, i) => <li key={`behav-${i}`}>{q}</li>)}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="situational">
                    <AccordionTrigger className="text-lg font-semibold bg-secondary/50 px-4 rounded-md">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Situational Questions
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4">
                         <ul className="list-decimal list-inside space-y-2">
                            {results.situationalQuestions.map((q, i) => <li key={`sit-${i}`}>{q}</li>)}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
              </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
