
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, Play, Square, AlertTriangle, Send } from "lucide-react";
import { generateInterviewQuestions, InterviewQuestionsOutput } from "@/ai/flows/generate-interview-questions";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type JobPosting = {
    id: string;
    title: string;
    description: string;
};

type Application = {
    jobId: string;
    applicantEmail: string;
    resumeDataUri: string;
    achievements: string;
    status: 'Applied' | 'Selected for Test' | 'Test Completed' | 'Selected for Interview' | 'Not Selected';
};

type Question = {
    type: 'technical' | 'behavioral' | 'situational';
    text: string;
};

export default function VoiceInterviewPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [job, setJob] = useState<JobPosting | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState("Loading interview session...");

    const [isQuestionPlaying, setIsQuestionPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const loadInterview = useCallback(async () => {
        setIsLoading(true);
        try {
            const jobId = sessionStorage.getItem('interviewJobId');
            if (!jobId) {
                toast({ variant: 'destructive', title: 'No interview selected.' });
                router.push('/seeker/my-applications');
                return;
            }

            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
            const allJobs: JobPosting[] = JSON.parse(localStorage.getItem('jobPostings') || '[]');
            const allApplications: Application[] = JSON.parse(localStorage.getItem('jobApplications') || '[]');

            const jobToInterview = allJobs.find(j => j.id === jobId);
            const application = allApplications.find(app => app.jobId === jobId && app.applicantEmail === loggedInUser.email);
            
            if (!jobToInterview || !application || application.status !== 'Selected for Interview') {
                 toast({ variant: 'destructive', title: 'Not Authorized', description: 'You have not been selected for an interview for this role.' });
                 router.push('/seeker/my-applications');
                 return;
            }

            setJob(jobToInterview);

            setLoadingMessage("Generating interview questions...");
            const { technicalQuestions, behavioralQuestions, situationalQuestions } = await generateInterviewQuestions({
                jobDescription: jobToInterview.description,
                resumeText: "" // For simplicity, not using resume text for now
            });

            const allQuestions: Question[] = [
                ...technicalQuestions.map(q => ({ type: 'technical' as const, text: q })),
                ...behavioralQuestions.map(q => ({ type: 'behavioral' as const, text: q })),
                ...situationalQuestions.map(q => ({ type: 'situational' as const, text: q })),
            ];

            setQuestions(allQuestions.slice(0, 5)); // Limit to 5 questions for now

        } catch (error) {
            console.error("Failed to load interview", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load interview session.' });
            router.push('/seeker/my-applications');
        } finally {
            setIsLoading(false);
            setLoadingMessage("");
        }
    }, [router, toast]);
    
    useEffect(() => {
        loadInterview();
    }, [loadInterview]);

    const playCurrentQuestion = async () => {
        if (!questions.length || isQuestionPlaying) return;

        setIsQuestionPlaying(true);
        try {
            const { audioDataUri } = await textToSpeech({ text: questions[currentQuestionIndex].text });
            if (audioRef.current) {
                audioRef.current.src = audioDataUri;
                await audioRef.current.play();
            }
        } catch (error) {
            console.error("Failed to play audio", error);
            toast({ variant: 'destructive', title: 'Audio Error' });
        } finally {
            // Event listener will set playing to false
        }
    };
    
    useEffect(() => {
        const audio = new Audio();
        audio.onended = () => setIsQuestionPlaying(false);
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = "";
        };
    }, []);


    if (isLoading) {
        return (
            <div className="flex flex-col h-full items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h2 className="text-xl font-semibold">{loadingMessage}</h2>
                <p className="text-muted-foreground">Please wait a moment...</p>
            </div>
        );
    }
    
    if (!job || questions.length === 0) {
        return (
             <Card className="transition-all hover:shadow-lg">
                <CardHeader>
                    <CardTitle>Interview Session</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Could not load interview questions. Please try again from the applications page.
                      </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <Card className="w-full max-w-3xl mx-auto transition-all hover:shadow-lg">
            <CardHeader>
                <CardTitle>Voice Interview for {job.title}</CardTitle>
                <CardDescription>
                    Question {currentQuestionIndex + 1} of {questions.length}. Click play to hear the question.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-6 rounded-lg bg-secondary min-h-[120px] flex items-center justify-center">
                    <p className="text-center text-lg font-medium">{currentQuestion.text}</p>
                </div>
                
                 <div className="flex flex-col items-center justify-center gap-4">
                     <Button onClick={playCurrentQuestion} size="lg" disabled={isQuestionPlaying || isRecording}>
                        {isQuestionPlaying ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Playing...
                            </>
                        ) : (
                             <>
                                <Play className="mr-2 h-5 w-5" /> Play Question
                            </>
                        )}
                    </Button>
                    <div className="flex items-center gap-4">
                        <Button 
                            size="lg" 
                            variant={isRecording ? "destructive" : "default"}
                            disabled={isQuestionPlaying}
                            onClick={() => setIsRecording(prev => !prev)}
                        >
                             {isRecording ? (
                                <>
                                    <Square className="mr-2 h-5 w-5" /> Stop Recording
                                </>
                            ) : (
                                <>
                                    <Mic className="mr-2 h-5 w-5" /> Start Recording
                                </>
                            )}
                        </Button>
                    </div>
                     {isRecording && (
                        <div className="flex items-center gap-2 text-destructive">
                            <Mic className="h-5 w-5 animate-pulse" />
                            <p>Recording in progress...</p>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" disabled={currentQuestionIndex === 0}>Previous</Button>
                 {currentQuestionIndex < questions.length - 1 ? (
                    <Button>Next Question</Button>
                 ) : (
                    <Button variant="default"><Send className="mr-2 h-4 w-4"/> Submit Interview</Button>
                 )}
            </CardFooter>
        </Card>
    );
}
