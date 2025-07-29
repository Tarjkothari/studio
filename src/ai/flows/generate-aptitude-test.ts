
'use server';

/**
 * @fileOverview Generates an aptitude test for a specific job role.
 *
 * - generateAptitudeTest - A function that generates a 40-question MCQ test.
 * - GenerateAptitudeTestInput - The input type for the generateAptitudeTest function.
 * - GenerateAptitudeTestOutput - The return type for the generateAptitudeTest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAptitudeTestInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job to generate a test for (e.g., "Senior Frontend Developer").'),
});
export type GenerateAptitudeTestInput = z.infer<typeof GenerateAptitudeTestInputSchema>;

const MCQSchema = z.object({
    question: z.string().describe("The multiple-choice question."),
    options: z.array(z.string()).length(4).describe("An array of exactly four possible answers."),
    correctAnswer: z.string().describe("The correct answer from the options array."),
});

const GenerateAptitudeTestOutputSchema = z.object({
    questions: z.array(MCQSchema).length(40).describe("An array of 40 multiple-choice questions."),
});
export type GenerateAptitudeTestOutput = z.infer<typeof GenerateAptitudeTestOutputSchema>;
export type MCQ = z.infer<typeof MCQSchema>;


export async function generateAptitudeTest(
  input: GenerateAptitudeTestInput
): Promise<GenerateAptitudeTestOutput> {
  return generateAptitudeTestFlow(input);
}

const Generate10AptitudeTestQuestionsSchema = z.object({
    questions: z.array(MCQSchema).length(10).describe("An array of 10 multiple-choice questions."),
});

const prompt = ai.definePrompt({
  name: 'generateAptitudeTestPrompt',
  input: {schema: GenerateAptitudeTestInputSchema},
  output: {schema: Generate10AptitudeTestQuestionsSchema},
  prompt: `You are an expert in creating professional aptitude tests for job candidates. Your task is to generate a comprehensive aptitude test for the following job role: {{{jobTitle}}}.

The test must contain exactly 10 multiple-choice questions. The questions should cover a range of topics relevant to the job title, including technical skills, problem-solving, and role-specific knowledge.

For each question, provide:
1.  A clear and concise question.
2.  Exactly four distinct options.
3.  The correct answer among the four options.

Generate the test now.
`,
});

const generateAptitudeTestFlow = ai.defineFlow(
  {
    name: 'generateAptitudeTestFlow',
    inputSchema: GenerateAptitudeTestInputSchema,
    outputSchema: GenerateAptitudeTestOutputSchema,
  },
  async input => {
    let allQuestions: MCQ[] = [];
    const requiredQuestions = 40;
    const questionsPerBatch = 10;
    const batches = requiredQuestions / questionsPerBatch;

    const promises = [];
    for (let i = 0; i < batches; i++) {
        promises.push(prompt(input));
    }
    const results = await Promise.all(promises);

    for (const result of results) {
        if (result.output?.questions) {
            allQuestions = allQuestions.concat(result.output.questions);
        }
    }

    return { questions: allQuestions };
  }
);


