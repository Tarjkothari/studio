import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-job-description.ts';
import '@/ai/flows/parse-resume.ts';
import '@/ai/flows/detect-bias-in-job-description.ts';
import '@/ai/flows/suggest-resume-improvements.ts';
import '@/ai/flows/rank-candidates.ts';