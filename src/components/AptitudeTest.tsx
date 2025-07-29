
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Timer, X, CameraOff } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { MCQ } from "@/ai/flows/generate-aptitude-test";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';

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

type AptitudeTestProps = {
    jobId: string;
    onTestFinished: () => void;
};

const TIME_LIMIT_MINUTES = 45;
const GAZE_THRESHOLD = 3; // seconds user can look away before test submits

export function AptitudeTest({ jobId, onTestFinished }: AptitudeTestProps) {
    const { toast } = useToast();

    const [job, setJob] = useState<JobPosting | null>(null);
    const [questions, setQuestions] = useState<MCQ[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState("Loading Aptitude Test...");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_MINUTES * 60);

    const videoRef = useRef<HTMLVideoElement>(null);
    const gazeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [isProctoringReady, setIsProctoringReady] = useState(false);

    const submitTest = useCallback((reason: string) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        let correctAnswers = 0;

        questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) {
                correctAnswers += 1;
            }
        });
        
        const finalScore = Math.floor(correctAnswers);

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
                title: "Test Submitted",
                description: reason,
            });
            window.dispatchEvent(new Event('storage'));
            onTestFinished();

        } catch (e) {
            console.error("Failed to submit test", e);
            toast({ variant: 'destructive', title: "Submission Failed" });
            setIsSubmitting(false);
        }
    }, [answers, questions, jobId, toast, onTestFinished, isSubmitting]);
    
    useEffect(() => {
        async function setup() {
            if (!jobId) return;
            setIsLoading(true);

            try {
                const allJobsString = localStorage.getItem('jobPostings');
                const allJobs: JobPosting[] = allJobsString ? JSON.parse(allJobsString) : [];
                const currentJob = allJobs.find(j => j.id === jobId);

                const allApplicationsString = localStorage.getItem('jobApplications');
                const allApplications: Application[] = allApplicationsString ? JSON.parse(allApplicationsString) : [];
                
                const loggedInUserString = localStorage.getItem('loggedInUser');
                const loggedInUser = loggedInUserString ? JSON.parse(loggedInUserString) : {};

                const application = allApplications.find(app => app.jobId === jobId && app.applicantEmail === loggedInUser.email);

                if (!currentJob || !application || application.status !== 'Selected for Test') {
                    toast({ variant: 'destructive', title: 'Unauthorized', description: 'You are not selected for this test or have already completed it.' });
                    onTestFinished();
                    return;
                }

                setJob(currentJob);

                const testString = localStorage.getItem(`test_${jobId}`);
                if (testString) {
                    const loadedQuestions = JSON.parse(testString);
                    setQuestions(loadedQuestions);
                    setAnswers(new Array(loadedQuestions.length).fill(''));
                } else {
                    toast({ variant: 'destructive', title: 'Test Not Found', description: "The test for this job hasn't been generated yet." });
                    onTestFinished();
                    return;
                }
            } catch (e) {
                console.error(e);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load the test.'});
                onTestFinished();
            } finally {
                setIsLoading(false);
            }
        }
        setup();
    }, [jobId, toast, onTestFinished]);

    // Proctoring setup
    useEffect(() => {
        if(isLoading) return;

        const setupProctoring = async () => {
            setLoadingMessage("Setting up proctoring...");
            
            // 1. Request Camera
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasCameraPermission(true);
            } catch (error) {
                console.error('Camera access denied:', error);
                setHasCameraPermission(false);
                toast({
                    variant: "destructive",
                    title: "Camera Access Required",
                    description: "You must enable your camera to take the test.",
                    duration: 10000
                });
                return;
            }

            // 2. Load ML Model
            try {
                await tf.setBackend('wasm');
                setWasmPaths(`https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tf.version_wasm}/dist/`);
                const model = await faceLandmarksDetection.load(
                    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
                    { maxFaces: 1 }
                );
                setIsProctoringReady(true);
                setLoadingMessage("");
                startMonitoring(model);
            } catch (error) {
                console.error("Failed to load proctoring model:", error);
                toast({ variant: "destructive", title: "Proctoring Error", description: "Could not start the monitoring service." });
            }
        };

        const startMonitoring = (model: faceLandmarksDetection.FaceLandmarksDetector) => {
            const checkGaze = async () => {
                if (!videoRef.current || videoRef.current.readyState < 3 || isSubmitting) return;

                const faces = await model.estimateFaces({ input: videoRef.current });
                
                if (faces.length === 0) {
                    if (!gazeTimeoutRef.current) {
                         gazeTimeoutRef.current = setTimeout(() => {
                           submitTest("Test submitted due to candidate not being visible.");
                        }, GAZE_THRESHOLD * 1000);
                    }
                } else {
                    if (gazeTimeoutRef.current) {
                        clearTimeout(gazeTimeoutRef.current);
                        gazeTimeoutRef.current = null;
                    }
                }
                requestAnimationFrame(checkGaze);
            };
            checkGaze();
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                submitTest("Test submitted because you switched to another tab.");
            }
        };

        setupProctoring();
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
            if(gazeTimeoutRef.current) clearTimeout(gazeTimeoutRef.current);
        };
    }, [isLoading, submitTest, toast]);


    useEffect(() => {
        if (!isProctoringReady || isSubmitting) return;

        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    submitTest("Time's up! Test submitted automatically.");
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isProctoringReady, isSubmitting, submitTest, toast]);


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

    if (isLoading || loadingMessage) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h2 className="text-xl font-semibold">{loadingMessage || "Loading..."}</h2>
                <p className="text-muted-foreground">Please wait.</p>
            </div>
        );
    }

    if(hasCameraPermission === false) {
        return (
            <div className="flex h-full w-full items-center justify-center p-4">
                 <Alert variant="destructive" className="max-w-md">
                    <CameraOff className="h-4 w-4" />
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Camera access was denied. You must enable camera permissions in your browser settings and refresh the page to start the test.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
         <div className="flex h-full w-full flex-col items-center justify-center bg-background p-4 sm:p-6 select-none">
            <Card className="max-w-4xl mx-auto w-full flex flex-col h-full max-h-full">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Aptitude Test: {job?.title}</CardTitle>
                            <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <video ref={videoRef} autoPlay muted playsInline className="h-20 w-auto rounded-md border" />
                            <Badge variant={minutes < 5 ? "destructive" : "default"} className="flex items-center gap-2 text-lg px-4 py-2">
                                <Timer className="h-5 w-5" />
                                <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                            </Badge>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <X className="h-5 w-5" />
                                        <span className="sr-only">Close Test</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure you want to end the test?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            If you end the test now, your current progress will be submitted. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Continue Test</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => submitTest("Test submitted by user.")}>End Test & Submit</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 flex-1 overflow-y-auto">
                    <p className="font-semibold text-lg">{currentQuestion.question}</p>
                    <RadioGroup value={answers[currentQuestionIndex]} onValueChange={handleAnswerSelect} className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                            <Label 
                                key={index} 
                                htmlFor={`option-${index}`} 
                                className="flex items-center space-x-3 p-3 rounded-md border border-input cursor-pointer transition-colors has-[:checked]:bg-accent has-[:checked]:border-primary"
                            >
                                <RadioGroupItem value={option} id={`option-${index}`} />
                                <span className="flex-1">{option}</span>
                            </Label>
                        ))}
                    </RadioGroup>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
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
                                <AlertDialogAction onClick={() => submitTest("Test submitted by user.")}>Submit</AlertDialogAction>
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
        </div>
    );
}
