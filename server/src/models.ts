import { openai } from '@ai-sdk/openai';

export const smallModel = () => openai(process.env.AI_SMALL_MODEL ?? 'gpt-5.6-luna');
export const largeModel = () => openai(process.env.AI_LARGE_MODEL ?? 'gpt-5.6-terra');
