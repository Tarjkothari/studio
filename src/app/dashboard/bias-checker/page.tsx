"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { detectBiasInJobDescription, DetectBiasInJobDescriptionOutput } from "@/ai/flows/detect-bias-in-job-description";
import { Loader2, Scale, ShieldAlert, ShieldCheck } from "lucide-react";

export default function BiasCheckerPage() {
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<DetectBiasInJobDescriptionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!jobDescription) {
      toast({
        variant: "destructive",
        title: "Missing Job Description",
        description: "Please provide a job description to analyze.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const biasResult = await detectBiasInJobDescription({ jobDescription });
      setResult(biasResult);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Analysis Failed",
        description: "An error occurred while checking for bias.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle>Job Description Bias Checker</CardTitle>
          <CardDescription>
            Paste a job description to analyze it for potential bias and get suggestions for improvement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={12}
              required
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Scale className="mr-2 h-4 w-4" /> Check for Bias
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
                   <h3 className="text-xl font-semibold">AI is at work</h3>
                   <p className="text-muted-foreground">Analyzing your job description for fairness and inclusivity.</p>
               </div>
           </CardContent>
        </Card>
     )}

      {result && (
        <Card className="transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div>
                {result.biasDetected ? (
                  <ShieldAlert className="h-10 w-10 text-destructive" />
                ) : (
                  <ShieldCheck className="h-10 w-10 text-green-500" />
                )}
              </div>
              <div>
                <CardTitle>
                  {result.biasDetected ? "Potential Bias Detected" : "Looks Good!"}
                </CardTitle>
                <CardDescription>
                   {result.biasDetected ? "Our AI found areas that could be improved for inclusivity." : "Our AI analysis didn't find obvious signs of bias."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Reasoning</h3>
              <p className="text-muted-foreground text-sm">{result.reasoning}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Suggestions for Improvement</h3>
              <p className="text-muted-foreground text-sm">{result.suggestions}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
