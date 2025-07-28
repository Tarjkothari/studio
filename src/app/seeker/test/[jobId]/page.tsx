
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Timer } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { MCQ } from "@/ai/flows/generate-aptitude-test";

type JobPosting = {
    id: string;
    title: string;
};

type Application = {
    jobId: string;
    applicantEmail: string;
    status: 'Applied' | 'Selected for Test' | 'Test Completed' | 'Not Selected';
    testScore?: number;
};

const TIME_LIMIT_MINUTES = 45;

export default function AptitudeTestPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const jobId = params.jobId as string;

    const [job, setJob] = useState<JobPosting | null>(null);
    const [questions, setQuestions] = useState<MCQ[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_MINUTES * 60);

    const submitTest = useCallback(() => {
        setIsSubmitting(true);
        let score = 0;
        const finalAnswers = [...answers];

        questions.forEach((q, index) => {
            const selectedAnswer = finalAnswers[index];
            if (selectedAnswer) {
                if (selectedAnswer === q.correctAnswer) {
                    score += 1;
                } else {
                    score -= 0.25;
                }
            }
        });
        
        const finalScore = Math.floor(Math.max(0, (score / 50) * 100));

        try {
            const allApplications: Application[] = JSON.parse(localStorage.getItem('jobApplications') || '[]');
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');

            const appIndex = allApplications.findIndex(app => app.jobId === jobId && app.applicantEmail === loggedInUser.email);
            if (appIndex !== -1) {
                allApplications[appIndex].status = 'Test Completed';
                allApplications[appIndex].testScore = finalScore;
                localStorage.setItem('jobApplications', JSON.stringify(allApplications));
            }
            
            toast({
                title: "Test Submitted Successfully!",
                description: "Your results have been sent to the job provider.",
            });
            router.push('/seeker/my-applications');

        } catch (e) {
            console.error("Failed to submit test", e);
            toast({ variant: 'destructive', title: "Submission Failed" });
            setIsSubmitting(false);
        }
    }, [answers, questions, jobId, router, toast]);
    
    useEffect(() => {
        if (!jobId) return;

        try {
            const allJobs: JobPosting[] = JSON.parse(localStorage.getItem('jobPostings') || '[]');
            const currentJob = allJobs.find(j => j.id === jobId);
            
            const allApplications: Application[] = JSON.parse(localStorage.getItem('jobApplications') || '[]');
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser') || '{}');
            const application = allApplications.find(app => app.jobId === jobId && app.applicantEmail === loggedInUser.email);

            if (!currentJob || !application || application.status !== 'Selected for Test') {
                toast({ variant: 'destructive', title: 'Unauthorized', description: 'You are not selected for this test.' });
                router.push('/seeker/my-applications');
                return;
            }

            setJob(currentJob);

            const fetchTest = () => {
                try {
                    const storedTest = JSON.parse(localStorage.getItem(`test_${jobId}`) || 'null');
                    if (storedTest) {
                        setQuestions(storedTest);
                    } else {
                        toast({ variant: 'destructive', title: 'Test Not Found', description: "The test for this job hasn't been generated yet." });
                        router.push('/seeker/my-applications');
                    }
                } catch (e) {
                    toast({ variant: 'destructive', title: 'Failed to load test.' });
                } finally {
                    setIsLoading(false);
                }
            };

            fetchTest();
        } catch (e) {
            console.error(e);
            router.push('/seeker/my-applications');
        }
    }, [jobId, router, toast]);

    useEffect(() => {
        if (isLoading || questions.length === 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    submitTest();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isLoading, questions.length, submitTest]);


    const handleAnswerSelect = (value: string) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = value;
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    if (isLoading || questions.length === 0) {
        return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h2 className="text-xl font-semibold">Loading Aptitude Test...</h2>
                <p className="text-muted-foreground">Please wait.</p>
            </div>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Aptitude Test: {job?.title}</CardTitle>
                        <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
                    </div>
                    <Badge variant={minutes < 5 ? "destructive" : "default"} className="flex items-center gap-2 text-lg px-4 py-2">
                        <Timer className="h-5 w-5" />
                        <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="font-semibold text-lg">{currentQuestion.question}</p>
                <RadioGroup value={answers[currentQuestionIndex]} onValueChange={handleAnswerSelect}>
                    {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 rounded-md border border-input has-[:checked]:bg-accent">
                            <RadioGroupItem value={option} id={`option-${index}`} />
                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
                    Previous
                </Button>
                {currentQuestionIndex === questions.length - 1 ? (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="default" disabled={isSubmitting}>
                                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Test
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. You will not be able to change your answers after submitting.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={submitTest}>Submit</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : (
                    <Button onClick={handleNext}>
                        Next
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
