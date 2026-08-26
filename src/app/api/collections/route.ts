import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateJSON, normaliseItems } from '@/lib/schemas';
import type { ReadingMode, Deck, Collection, InterviewDeck } from '@/types';

export const dynamic = 'force-dynamic';

const MODES: ReadingMode[] = ['flashcard', 'qa', 'article', 'notes', 'mcq', 'interview'];

interface FileCollection {
  collection: Collection;
  decks: Deck[];
}

export async function GET() {
  const collectionsDir = path.join(process.cwd(), 'collections');

  if (!fs.existsSync(collectionsDir)) {
    return NextResponse.json([]);
  }

  const result: FileCollection[] = [];

  // Each direct subfolder of collections/ is one collection
  const entries = fs.readdirSync(collectionsDir, { withFileTypes: true });
  const collectionFolders = entries.filter((e) => e.isDirectory());

  for (const folderEntry of collectionFolders) {
    const collectionSlug = folderEntry.name;
    const collectionPath = path.join(collectionsDir, collectionSlug);

    // Derive a human-readable name from the folder name
    const collectionName = collectionSlug
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const collectionId = `filecol:${collectionSlug}`;
    const decks: Deck[] = [];

    // Scan mode subfolders inside the collection folder
    for (const mode of MODES) {
      const modeDir = path.join(collectionPath, mode);
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
              id: `filecol:${collectionSlug}:${mode}:${file}`,
              name: deckName.charAt(0).toUpperCase() + deckName.slice(1),
              mode,
              uploadedAt: stat.mtime.toISOString(),
              itemCount: isInterview
                ? (interviewData?.questions.length ?? 0)
                : (Array.isArray(parsedData) ? parsedData.length : 0),
              items: parsedData as Deck['items'],
              ...(isInterview && {
                role: interviewData?.role,
                level: interviewData?.level,
              }),
            };

            decks.push(deck);
          } else {
            console.warn(`[rdapp API] Validation failed: collections/${collectionSlug}/${mode}/${file}`, validation.errors);
          }
        } catch (err) {
          console.error(`[rdapp API] Failed to parse: collections/${collectionSlug}/${mode}/${file}`, err);
        }
      }
    }

    // Sort decks by mtime
    decks.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    const collection: Collection = {
      id: collectionId,
      name: collectionName,
      deckIds: decks.map((d) => d.id),
      createdAt: fs.statSync(collectionPath).mtime.toISOString(),
    };

    result.push({ collection, decks });
  }

  return NextResponse.json(result);
}
