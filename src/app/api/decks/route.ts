import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateJSON, normaliseItems } from '@/lib/schemas';
import type { ReadingMode, Deck, InterviewDeck } from '@/types';

export const dynamic = 'force-dynamic';

const MODES: ReadingMode[] = ['flashcard', 'qa', 'article', 'notes', 'mcq', 'interview'];

export async function GET() {
  const decksDir = path.join(process.cwd(), 'decks');
  
  if (!fs.existsSync(decksDir)) {
    return NextResponse.json([]);
  }

  const decks: Deck[] = [];

  for (const mode of MODES) {
    const modeDir = path.join(decksDir, mode);
    if (!fs.existsSync(modeDir)) continue;

    const files = fs.readdirSync(modeDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const filePath = path.join(modeDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        const validation = validateJSON(mode, data);

        if (validation.valid) {
          const parsedData = normaliseItems(mode, data);
          const isInterview = mode === 'interview';
          const interviewData = isInterview ? (parsedData as InterviewDeck) : null;
          
          const stat = fs.statSync(filePath);
          const deckName = file.replace(/\.json$/i, '').replace(/[-_]/g, ' ');

          const deck: Deck = {
            id: `file:${mode}:${file}`,
            name: deckName.charAt(0).toUpperCase() + deckName.slice(1),
            mode,
            uploadedAt: stat.mtime.toISOString(),
            itemCount: isInterview ? (interviewData?.questions.length ?? 0) : (Array.isArray(parsedData) ? parsedData.length : 0),
            items: parsedData as Deck['items'],
            ...(isInterview && {
              role: interviewData?.role,
              level: interviewData?.level,
            }),
          };

          decks.push(deck);
        } else {
          console.warn(`[rdapp API] Validation failed for file ${file} in mode ${mode}`, validation.errors);
        }
      } catch (err) {
        console.error(`[rdapp API] Failed to parse file ${file} in mode ${mode}`, err);
      }
    }
  }

  // Sort by mtime descending
  decks.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  return NextResponse.json(decks);
}
