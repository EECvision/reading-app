import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateJSON, normaliseItems } from '@/lib/schemas';
import type { Deck, InterviewDeck, ReadingMode } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { deckId: string } }
) {
  const { deckId } = params;
  
  if (!deckId.startsWith('file:')) {
    return NextResponse.json({ error: 'Invalid file deck ID' }, { status: 400 });
  }

  // format: file:mode:filename.json
  const parts = deckId.split(':');
  if (parts.length < 3) {
    return NextResponse.json({ error: 'Invalid file deck ID format' }, { status: 400 });
  }

  const mode = parts[1] as ReadingMode;
  const filename = parts.slice(2).join(':'); // filename could technically contain colons

  const decksDir = path.join(process.cwd(), 'decks');
  const filePath = path.join(decksDir, mode, filename);

  // Prevent directory traversal attacks
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(decksDir))) {
    return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    const validation = validateJSON(mode, data);

    if (!validation.valid) {
      return NextResponse.json({ error: 'Invalid deck format', details: validation.errors }, { status: 400 });
    }

    const parsedData = normaliseItems(mode, data);
    const isInterview = mode === 'interview';
    const interviewData = isInterview ? (parsedData as InterviewDeck) : null;
    
    const stat = fs.statSync(filePath);
    const deckName = filename.replace(/\.json$/i, '').replace(/[-_]/g, ' ');

    const deck: Deck = {
      id: deckId,
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

    return NextResponse.json(deck);
  } catch (err) {
    console.error(`[rdapp API] Failed to parse file ${filename} in mode ${mode}`, err);
    return NextResponse.json({ error: 'Failed to parse deck' }, { status: 500 });
  }
}
