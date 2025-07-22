// This file houses the Genkit flow for parsing resumes and extracting key information.

'use server';

/**
 * @fileOverview Parses resume PDFs and extracts key information such as skills, experience, and education.
 *
 * - parseResume - A function that handles the resume parsing process.
 * - ParseResumeInput - The input type for the parseResume function.
 * - ParseResumeOutput - The return type for the parseResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A resume in PDF format, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ParseResumeInput = z.infer<typeof ParseResumeInputSchema>;

const ParseResumeOutputSchema = z.object({
  skills: z.array(z.string()).describe('A list of skills extracted from the resume.'),
  experience: z
    .array(
      z.object({
        title: z.string().describe('The job title.'),
        company: z.string().describe('The company name.'),
        dates: z.string().describe('The dates of employment.'),
        description: z.string().describe('The job description.'),
      })
    )
    .describe('A list of work experiences extracted from the resume.'),
  education: z
    .array(
      z.object({
        institution: z.string().describe('The name of the institution.'),
        degree: z.string().describe('The degree obtained.'),
        dates: z.string().describe('The dates of attendance.'),
      })
    )
    .describe('A list of education entries extracted from the resume.'),
});
export type ParseResumeOutput = z.infer<typeof ParseResumeOutputSchema>;

export async function parseResume(input: ParseResumeInput): Promise<ParseResumeOutput> {
  return parseResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseResumePrompt',
  input: {schema: ParseResumeInputSchema},
  output: {schema: ParseResumeOutputSchema},
  prompt: `You are an expert resume parser. Extract the following information from the resume provided in the document.

Skills: A list of skills mentioned in the resume.
Experience: A list of work experiences, including job title, company, dates of employment, and job description.
Education: A list of education entries, including institution, degree, and dates of attendance.

Resume:
{{media url=resumeDataUri}}`,
});

const parseResumeFlow = ai.defineFlow(
  {
    name: 'parseResumeFlow',
    inputSchema: ParseResumeInputSchema,
    outputSchema: ParseResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
