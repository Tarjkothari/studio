
'use server';
/**
 * @fileOverview Analyzes the gap between a candidate's resume and a job description.
 *
 * - analyzeSkillGap - A function that identifies matching and missing skills.
 * - AnalyzeSkillGapInput - The input type for the analyzeSkillGap function.
 * - AnalyzeSkillGapOutput - The return type for the analyzeSkillGap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSkillGapInputSchema = z.object({
  resumeText: z.string().describe("The full text content of the candidate's resume."),
  jobDescription: z.string().describe('The job description to compare against.'),
});
export type AnalyzeSkillGapInput = z.infer<typeof AnalyzeSkillGapInputSchema>;

const AnalyzeSkillGapOutputSchema = z.object({
  matchingSkills: z
    .array(z.string())
    .describe('A list of key skills from the job description that are present in the resume.'),
  missingSkills: z
    .array(z.string())
    .describe('A list of key skills from the job description that are missing from the resume.'),
  summary: z
    .string()
    .describe("A brief summary of the candidate's strengths and weaknesses for this specific role."),
});
export type SkillGapAnalysisOutput = z.infer<typeof AnalyzeSkillGapOutputSchema>;

export async function analyzeSkillGap(
  input: AnalyzeSkillGapInput
): Promise<SkillGapAnalysisOutput> {
  return analyzeSkillGapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSkillGapPrompt',
  input: {schema: AnalyzeSkillGapInputSchema},
  output: {schema: AnalyzeSkillGapOutputSchema},
  prompt: `You are an expert career coach and recruiter. Your task is to analyze a candidate's resume against a job description and identify the skill gap.

First, carefully review the job description to understand the key required skills and qualifications.
Then, review the candidate's resume to see what skills and experiences are listed.

Based on your analysis, provide:
1.  A list of 'matchingSkills': The key skills required by the job that are clearly present in the resume.
2.  A list of 'missingSkills': The key skills required by the job that are not apparent in the resume.
3.  A 'summary': A brief, constructive summary of the candidate's fit for the role, highlighting their strengths and areas where they could improve or gain more experience.

Job Description:
{{{jobDescription}}}

Candidate's Resume:
{{{resumeText}}}
`,
});

const analyzeSkillGapFlow = ai.defineFlow(
  {
    name: 'analyzeSkillGapFlow',
    inputSchema: AnalyzeSkillGapInputSchema,
    outputSchema: AnalyzeSkillGapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
