'use server';

/**
 * @fileOverview Analyzes a job description to identify key requirements and qualifications.
 *
 * - analyzeJobDescription - A function that handles the job description analysis process.
 * - AnalyzeJobDescriptionInput - The input type for the analyzeJobDescription function.
 * - AnalyzeJobDescriptionOutput - The return type for the analyzeJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeJobDescriptionInputSchema = z.object({
  jobDescription: z.string().describe('The job description to analyze.'),
});
export type AnalyzeJobDescriptionInput = z.infer<
  typeof AnalyzeJobDescriptionInputSchema
>;

const AnalyzeJobDescriptionOutputSchema = z.object({
  keyRequirements: z
    .string()
    .describe('A summary of the key requirements for the job.'),
  keyQualifications: z
    .string()
    .describe('A summary of the key qualifications for the job.'),
});
export type AnalyzeJobDescriptionOutput = z.infer<
  typeof AnalyzeJobDescriptionOutputSchema
>;

export async function analyzeJobDescription(
  input: AnalyzeJobDescriptionInput
): Promise<AnalyzeJobDescriptionOutput> {
  return analyzeJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeJobDescriptionPrompt',
  input: {schema: AnalyzeJobDescriptionInputSchema},
  output: {schema: AnalyzeJobDescriptionOutputSchema},
  prompt: `You are an expert in analyzing job descriptions. Your goal is to identify the key requirements and qualifications for the job.

  Analyze the following job description:
  {{jobDescription}}

  Provide a summary of the key requirements and qualifications.
  `,
});

const analyzeJobDescriptionFlow = ai.defineFlow(
  {
    name: 'analyzeJobDescriptionFlow',
    inputSchema: AnalyzeJobDescriptionInputSchema,
    outputSchema: AnalyzeJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
