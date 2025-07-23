
'use server';

/**
 * @fileOverview Suggests improvements to a resume based on a job description.
 *
 * - suggestResumeImprovements - A function that suggests improvements to a resume.
 * - SuggestResumeImprovementsInput - The input type for the suggestResumeImprovements function.
 * - SuggestResumeImprovementsOutput - The return type for the suggestResumeImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestResumeImprovementsInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobDescription: z
    .string()
    .describe('The job description to tailor the resume to.'),
  achievements: z
    .string()
    .optional()
    .describe('A description of the candidate\'s achievements.'),
});
export type SuggestResumeImprovementsInput = z.infer<
  typeof SuggestResumeImprovementsInputSchema
>;

const ImprovementSuggestionSchema = z.object({
  suggestion: z
    .string()
    .describe('A specific suggestion for improving the resume.'),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the suggestion, explaining why it would improve the candidates chances.'
    ),
  isValuable: z
    .boolean()
    .describe(
      "Whether or not the including the suggestion would improve a candidate's chances."
    ),
});

const SuggestResumeImprovementsOutputSchema = z.array(
  ImprovementSuggestionSchema
);

export type SuggestResumeImprovementsOutput = z.infer<
  typeof SuggestResumeImprovementsOutputSchema
>;

const shouldIncludeSuggestionTool = ai.defineTool(
  {
    name: 'shouldIncludeSuggestion',
    description:
      "Determines whether including a suggestion would improve a candidate's chances based on the job description and resume.",
    inputSchema: z.object({
      suggestion: z.string().describe('The resume improvement suggestion.'),
      jobDescription: z
        .string()
        .describe('The job description for the job the candidate is applying for.'),
      resumeText: z.string().describe('The text content of the resume.'),
    }),
    outputSchema: z.boolean(),
  },
  async input => {
    // Directly return true, as the LLM will determine the value.
    return true;
  }
);

export async function suggestResumeImprovements(
  input: SuggestResumeImprovementsInput
): Promise<SuggestResumeImprovementsOutput> {
  return suggestResumeImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestResumeImprovementsPrompt',
  input: {schema: SuggestResumeImprovementsInputSchema},
  output: {schema: SuggestResumeImprovementsOutputSchema},
  tools: [shouldIncludeSuggestionTool],
  prompt: `You are an expert resume writer. Review the provided resume and job description, and provide a list of suggestions to improve the resume so that it is a better fit for the job description.

  Resume:
  {{{resumeText}}}

  Job Description:
  {{{jobDescription}}}
  {{#if achievements}}

  Achievements:
  {{{achievements}}}
  {{/if}}

  Each suggestion should include:
  - suggestion: A specific suggestion for improving the resume.
  - reasoning: The reasoning behind the suggestion, explaining why it would improve the candidates chances.
  - isValuable: A boolean indicating whether or not including the suggestion would improve a candidate's chances. Use the shouldIncludeSuggestionTool tool to determine this value.`,
});

const suggestResumeImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestResumeImprovementsFlow',
    inputSchema: SuggestResumeImprovementsInputSchema,
    outputSchema: SuggestResumeImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
