
'use server';

/**
 * @fileOverview Generates interview questions based on a job description and a candidate's resume.
 *
 * - generateInterviewQuestions - A function that creates tailored interview questions.
 * - GenerateInterviewQuestionsInput - The input type for the generateInterviewQuestions function.
 * - InterviewQuestionsOutput - The return type for the generateInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionsInputSchema = z.object({
  jobDescription: z.string().describe('The job description for the role.'),
  resumeText: z.string().describe("The full text of the candidate's resume."),
});
export type GenerateInterviewQuestionsInput = z.infer<
  typeof GenerateInterviewQuestionsInputSchema
>;

const InterviewQuestionsOutputSchema = z.object({
  technicalQuestions: z.array(z.string()).describe('A list of technical questions to assess the candidate\'s hard skills.'),
  behavioralQuestions: z.array(z.string()).describe('A list of behavioral questions to assess the candidate\'s past performance and soft skills.'),
  situationalQuestions: z.array(z.string()).describe('A list of situational questions to assess the candidate\'s problem-solving and decision-making abilities.'),
});
export type InterviewQuestionsOutput = z.infer<
  typeof InterviewQuestionsOutputSchema
>;

export async function generateInterviewQuestions(
  input: GenerateInterviewQuestionsInput
): Promise<InterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: {schema: GenerateInterviewQuestionsInputSchema},
  output: {schema: InterviewQuestionsOutputSchema},
  prompt: `You are an expert hiring manager and interviewer. Your task is to generate a comprehensive set of interview questions based on a specific job description and a candidate's resume. The questions should be designed to deeply evaluate the candidate's suitability for the role.

Analyze the provided job description and resume to identify key areas of overlap, potential gaps, and specific experiences to probe into.

Generate three categories of questions:
1.  **Technical Questions**: These should directly test the technical skills and knowledge required in the job description, especially those mentioned in the candidate's resume.
2.  **Behavioral Questions**: These should ask the candidate to provide specific examples of how they've handled past situations. Focus on soft skills like teamwork, problem-solving, and leadership as they relate to the job.
3.  **Situational Questions**: These should present hypothetical scenarios the candidate might face in this role and ask how they would respond.

Job Description:
{{{jobDescription}}}

Candidate's Resume:
{{{resumeText}}}

Generate a list of insightful and challenging questions for each category.`,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: InterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
