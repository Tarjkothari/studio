
import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-job-description.ts';
import '@/ai/flows/parse-resume.ts';
import '@/ai/flows/detect-bias-in-job-description.ts';
import '@/ai/flows/suggest-resume-improvements.ts';
import '@/ai/flows/rank-candidates.ts';
import '@/ai/flows/generate-aptitude-test.ts';
import '@/ai/flows/generate-interview-questions.ts';
import '@/ai/flows/analyze-skill-gap.ts';
import '@/ai/flows/text-to-speech.ts';
