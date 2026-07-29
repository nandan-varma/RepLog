import type { ParsedLog, SearchFilterResult, TextReply } from 'replog-shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function postAI<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_URL}/api/ai${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AI request to ${path} failed: ${res.status}`);
  return res.json();
}

export const aiSearch = (query: string) => postAI<SearchFilterResult>('/search', { query });

export const aiParseLog = (text: string) => postAI<ParsedLog>('/log', { text });

export const aiTip = (exerciseName: string, kind: 'form' | 'substitute') =>
  postAI<TextReply>('/tip', { exerciseName, kind });

export const aiSummary = (exerciseNames: string[], totalSets: number) =>
  postAI<TextReply>('/summary', { exerciseNames, totalSets });

export const aiCoach = (message: string, context: string) => postAI<TextReply>('/coach', { message, context });
