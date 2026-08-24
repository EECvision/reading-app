# Reading App — Implementation Plan

A fully responsive, browser-based study app built in **Next.js 16 + React 19 + TypeScript**. Users upload JSON decks, choose a reading mode, and listen to or study content through multiple interactive session styles. All data persists in **LocalStorage** — no backend required.

---

## Tech Stack

| Concern   | Choice                                                |
| --------- | ----------------------------------------------------- |
| Framework | Next.js 16.3.2 (App Router)                           |
| Language  | TypeScript                                            |
| Styling   | Vanilla CSS (custom design system, dark/light toggle) |
| TTS       | Browser Web Speech API (`SpeechSynthesisUtterance`)   |
| Storage   | LocalStorage                                          |
| Fonts     | Google Fonts — Inter + Outfit                         |

---

## Reading Modes & JSON Schemas

Each mode defines a strict JSON schema. On upload, the app validates the file matches the selected mode's schema and shows inline errors if not. Users can download a template `.json` for any mode.

### 1. Flashcard Mode

```json
[
  {
    "word": "Ephemeral",
    "definition": "Lasting for a very short time",
    "example": "The ephemeral nature of fame."
  }
]
```

### 2. Q&A Mode

```json
[
  {
    "question": "What is osmosis?",
    "answer": "Movement of water across a membrane",
    "hint": "Think semi-permeable"
  }
]
```

### 3. Article / Passage Mode

```json
[
  {
    "title": "The Rise of AI",
    "content": "Long passage text...",
    "summary": "AI is growing fast."
  }
]
```

### 4. Structured Notes Mode

```json
[
  {
    "topic": "Photosynthesis",
    "subtopics": [
      { "heading": "Light Reactions", "body": "Occur in the thylakoid..." },
      { "heading": "Calvin Cycle", "body": "Occurs in the stroma..." }
    ]
  }
]
```

### 5. MCQ Mode

```json
[
  {
    "question": "Which gas do plants absorb?",
    "options": ["O2", "CO2", "N2", "H2"],
    "correct_answer": "CO2",
    "explanation": "Plants use CO2 for photosynthesis."
  }
]
```

### 6. Interview Mode

Mimics a real interview structure — role, seniority level, categories, follow-up questions, and optional code snippets.

```json
{
  "role": "Frontend Developer",
  "level": "Mid-level",
  "questions": [
    {
      "id": "q1",
      "category": "React",
      "difficulty": "medium",
      "question": "Explain the difference between useEffect and useLayoutEffect.",
      "answer": "useEffect runs asynchronously after paint. useLayoutEffect runs synchronously after DOM mutations but before paint.",
      "code_snippet": "useEffect(() => { /* side effect */ }, [dep]);",
      "follow_ups": [
        {
          "question": "When would you choose useLayoutEffect over useEffect?",
          "answer": "When you need to read layout from the DOM and re-render synchronously before the browser paints."
        }
      ]
    }
  ]
}
```

**Key fields:**

- `role` & `level` — displayed as the session header (e.g. "Mid-level Frontend Developer Interview")
- `category` — used for filtering (e.g. React, System Design, Behavioural, CSS, TypeScript)
- `difficulty` — `easy` | `medium` | `hard` (shown as a badge; affects spaced repetition weighting)
- `code_snippet` — optional; rendered as a syntax-highlighted code block
- `follow_ups` — optional array of follow-up Q&As revealed after the main answer

**Session flow for Interview Mode:**

1. TTS reads the question aloud
2. User thinks / speaks their answer (no input needed — self-assessed)
3. User taps **Reveal Answer** → model answer shown + TTS reads it
4. Follow-up questions appear one by one
5. User rates themselves: **Got it** / **Needs Review**

---

## Session Modes (per Reading Mode)

| Session Type             | Description                             |
| ------------------------ | --------------------------------------- |
| **Card Flip / Visual**   | Show front, tap to reveal back          |
| **TTS Listen**           | App reads item aloud, auto-advances     |
| **Both (Read + Listen)** | Show text AND read aloud simultaneously |
| **Audio-First**          | Plays TTS, user taps to reveal text     |
| **Study Session**        | Show prompt → pause → reveal answer     |

---

## Core Features

- **TTS Controls**: Speed (0.5×–2×), voice selector, pause/resume/skip/previous
- **Autoplay**: Auto-advance to next item after TTS finishes
- **Shuffle**: Randomize item order
- **Tag/Category filter**: If JSON items include an optional `"category"` or `"tags"` field
- **Progress bar**: Visual indicator through the deck
- **Progress tracking per deck**:
  - Count of items seen (`12 of 50 reviewed`)
  - Mark items as **Known** / **Needs Review**
  - End-of-session summary: score, time taken, % known
- **Spaced repetition**: Items marked "needs review" are surfaced again sooner
- **Dark/Light mode toggle**: Persisted in LocalStorage

---

## App Pages & Routing

```
/                     → Home / Dashboard
/upload               → Upload + mode select + JSON validation
/session/[deckId]     → Active study session
/session/[deckId]/summary → Post-session stats summary
/decks                → Saved decks list (LocalStorage)
```

---

## File Structure

```
src/
  app/
    layout.tsx                  # Root layout (font, theme provider, metadata)
    page.tsx                    # Home/Dashboard
    globals.css                 # Design system: tokens, typography, utilities
    upload/
      page.tsx                  # Upload flow
    session/
      [deckId]/
        page.tsx                # Session player
        summary/
          page.tsx              # End-of-session summary
    decks/
      page.tsx                  # Saved decks list

  components/
    ui/
      ThemeToggle.tsx           # Dark/light toggle button
      ProgressBar.tsx           # Animated progress bar
      Button.tsx                # Reusable button
      Modal.tsx                 # Generic modal overlay
    upload/
      ModeSelector.tsx          # Choose reading mode (5 cards)
      FileUpload.tsx            # Drag-and-drop + file picker
      JsonValidator.tsx         # Schema validation + inline error display
      TemplateDownload.tsx      # Download sample .json button
    session/
      SessionControls.tsx       # Play/pause/skip/speed/voice controls
      FlashCard.tsx             # Flip card component
      QACard.tsx                # Question → reveal answer
      ArticleCard.tsx           # Full passage display
      NotesCard.tsx             # Topic + subtopics layout
      MCQCard.tsx               # Multiple choice interaction
      AudioFirstOverlay.tsx     # Audio-first reveal UI
      InterviewCard.tsx         # Interview Q&A with follow-ups, code block, self-rating
    decks/
      DeckCard.tsx              # Saved deck card with progress ring

  lib/
    schemas.ts                  # Zod-less JSON schema validators (pure TS)
    localStorage.ts             # CRUD helpers for LocalStorage
    tts.ts                      # Web Speech API wrapper (speak, pause, resume, stop)
    progress.ts                 # Progress tracking logic, spaced repetition scoring
    templates.ts                # Sample JSON templates for each mode

  types/
    index.ts                    # All shared TypeScript types
```

---

## Design System

- **Color palette**: Deep indigo/violet primary, warm amber accent, slate darks — a premium dark-first system
- **Light mode**: Soft off-white backgrounds with subtle shadows
- **Glassmorphism**: Cards use `backdrop-filter: blur()` with translucent backgrounds
- **Micro-animations**: Card flip (3D CSS transform), slide-in transitions, progress bar smooth fill
- **Typography**: Outfit for headings, Inter for body

---

## Progress & Spaced Repetition Logic

- Per-deck progress stored in LocalStorage key `rdapp_progress_{deckId}`
- Structure: `{ seen: Set<id>, known: Set<id>, review: Set<id>, lastSession: Date }`
- Items in `review` are inserted at 2× frequency in shuffle
- End summary calculates: `% known`, `items to review`, `total time`

---

## Verification Plan

### Build Check

```bash
npm run build
```

### Manual Verification

1. Upload a valid JSON → should load and show session
2. Upload invalid JSON → should show schema error
3. TTS plays, controls work (pause/resume/speed/voice)
4. Flip card animates on click
5. Progress persists across page refresh (LocalStorage)
6. Dark/light toggle works and persists
7. End-of-session summary shows correct stats
8. Download template works for all 5 modes
9. Fully responsive on mobile and desktop

---

## Open Questions

> [!NOTE]
> All design decisions below have been resolved from the grill session. No blockers remain.

- ✅ JSON schemas are fixed per mode with in-app validation
- ✅ LocalStorage only (no backend)
- ✅ English TTS only
- ✅ Dark/light toggle persisted
- ✅ All 6 reading modes supported (including Interview Mode)
- ✅ Template download for each mode
