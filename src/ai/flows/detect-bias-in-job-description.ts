'use server';
/**
 * @fileOverview Detects potential bias in job descriptions.
 *
 * - detectBiasInJobDescription - A function that analyzes job descriptions for potential bias.
 * - DetectBiasInJobDescriptionInput - The input type for the detectBiasInJobDescription function.
 * - DetectBiasInJobDescriptionOutput - The return type for the detectBiasInJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectBiasInJobDescriptionInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The job description to analyze for potential bias.'),
});
export type DetectBiasInJobDescriptionInput = z.infer<
  typeof DetectBiasInJobDescriptionInputSchema
>;

const DetectBiasInJobDescriptionOutputSchema = z.object({
  biasDetected: z
    .boolean()
    .describe('Whether potential bias was detected in the job description.'),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the bias detection, including specific examples from the job description.'
    ),
  suggestions: z
    .string()
    .describe(
      'Suggestions for improving the job description to reduce bias and promote inclusivity.'
    ),
});
export type DetectBiasInJobDescriptionOutput = z.infer<
  typeof DetectBiasInJobDescriptionOutputSchema
>;

export async function detectBiasInJobDescription(
  input: DetectBiasInJobDescriptionInput
): Promise<DetectBiasInJobDescriptionOutput> {
  return detectBiasInJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectBiasInJobDescriptionPrompt',
  input: {schema: DetectBiasInJobDescriptionInputSchema},
  output: {schema: DetectBiasInJobDescriptionOutputSchema},
  prompt: `You are an AI expert in detecting potential bias in job descriptions.

  Analyze the following job description for potential bias related to gender, race, age, religion, sexual orientation, disability, or other protected characteristics. Provide reasoning for your assessment, including specific examples from the job description, and offer suggestions for improvement.

  Job Description: {{{jobDescription}}}`,
});

const detectBiasInJobDescriptionFlow = ai.defineFlow(
  {
    name: 'detectBiasInJobDescriptionFlow',
    inputSchema: DetectBiasInJobDescriptionInputSchema,
    outputSchema: DetectBiasInJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
