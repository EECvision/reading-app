import type { ReadingMode } from '@/types';

// ─── Template data for each mode ─────────────────────────────────────────────
// All sample text is written for TTS readability:
//   • No angle brackets, backticks, or code tokens in spoken fields
//   • No operator symbols (==, ===, <T>, etc.) in answer/definition text
//   • No quoted code keywords ('interface', 'type', etc.)
//   • Abbreviations spelled out on first use
//   • Slashes replaced with "or" / "and"
//   • code_snippet fields (interview only) are display-only and never spoken

const templates: Record<ReadingMode, unknown> = {
  flashcard: [
    {
      id: 'item-0',
      word: 'Ephemeral',
      definition: 'Lasting for a very short time; transitory.',
      example: 'Social media trends are often ephemeral, disappearing from public consciousness within days.',
      category: 'Vocabulary',
    },
    {
      id: 'item-1',
      word: 'Ubiquitous',
      definition: 'Present, appearing, or found everywhere.',
      example: 'Smartphones have become ubiquitous in modern society, owned by billions of people worldwide.',
      category: 'Vocabulary',
    },
  ],

  qa: [
    {
      id: 'item-0',
      question: 'What is the difference between speed and velocity?',
      answer: 'Speed is a scalar quantity that measures how fast an object is moving, expressed as distance divided by time. Velocity is a vector quantity that includes both speed and direction. Two objects can have the same speed but different velocities if they are moving in different directions.',
      hint: 'Think about whether direction matters.',
      category: 'Physics',
    },
    {
      id: 'item-1',
      question: 'What causes seasons on Earth?',
      answer: 'Seasons are caused by the tilt of the Earth\'s axis, which is approximately 23.5 degrees relative to its orbit around the Sun. As Earth orbits, this tilt causes different hemispheres to receive more direct sunlight at different times of year. The distance from the Sun is not the primary factor.',
      hint: 'Think about Earth\'s axial tilt, not its distance from the Sun.',
      category: 'Science',
    },
  ],

  article: [
    {
      id: 'item-0',
      title: 'The Science of Sleep',
      content: 'Sleep is one of the most vital biological processes for human health. During sleep, the brain cycles through several stages roughly every 90 minutes. The two main categories are non-rapid eye movement sleep and rapid eye movement sleep, commonly called REM sleep. During deep sleep, the body repairs tissues, builds bone and muscle, and strengthens the immune system. REM sleep is critical for memory consolidation and emotional regulation. Adults who consistently sleep fewer than 7 hours per night face a significantly elevated risk of obesity, heart disease, and depression.',
      summary: 'Sleep cycles through distinct stages, each critical for physical repair and mental health. Chronic sleep deprivation significantly increases the risk of serious illness.',
      category: 'Health',
    },
  ],

  notes: [
    {
      id: 'item-0',
      topic: 'The Water Cycle',
      category: 'Geography',
      subtopics: [
        {
          heading: 'Evaporation',
          body: 'Heat from the Sun causes liquid water from oceans, lakes, and rivers to convert into water vapour, which rises into the atmosphere. Transpiration from plants also contributes to this process.',
        },
        {
          heading: 'Condensation',
          body: 'As water vapour rises and cools at higher altitudes, it condenses around tiny dust particles to form clouds and fog.',
        },
        {
          heading: 'Precipitation',
          body: 'When water droplets in clouds combine and grow heavy enough, they fall back to Earth as rain, snow, sleet, or hail, depending on the temperature conditions.',
        },
        {
          heading: 'Collection and Runoff',
          body: 'Precipitation collects in oceans, rivers, and lakes, or soaks into the ground to replenish groundwater. Surface runoff flows downhill into bodies of water, restarting the cycle.',
        },
      ],
    },
  ],

  mcq: [
    {
      id: 'item-0',
      question: 'Which planet in our solar system has the most known moons?',
      options: [
        'Jupiter',
        'Saturn',
        'Uranus',
        'Neptune',
      ],
      correct_answer: 'Saturn',
      explanation: 'Saturn holds the record for the most known moons, with over 140 confirmed as of recent discoveries. Its moon Titan is particularly notable as the only moon with a dense atmosphere.',
      category: 'Astronomy',
    },
    {
      id: 'item-1',
      question: 'What is the primary function of red blood cells in the human body?',
      options: [
        'Fighting infection',
        'Transporting oxygen',
        'Producing hormones',
        'Regulating temperature',
      ],
      correct_answer: 'Transporting oxygen',
      explanation: 'Red blood cells contain a protein called haemoglobin that binds to oxygen in the lungs and carries it through the bloodstream to all tissues in the body. They also carry carbon dioxide back to the lungs to be exhaled.',
      category: 'Biology',
    },
  ],

  interview: {
    role: 'Frontend Developer',
    level: 'Mid-level',
    questions: [
      {
        id: 'q1',
        category: 'React',
        difficulty: 'medium',
        question: 'Explain the difference between useEffect and useLayoutEffect.',
        answer: 'useEffect runs asynchronously after the browser has painted the screen, making it suitable for side effects that do not affect layout. useLayoutEffect runs synchronously after DOM mutations but before the browser paints, which is useful when you need to read layout from the DOM and synchronously re-render to prevent visual flicker.',
        code_snippet: "// useEffect — runs after paint\nuseEffect(() => {\n  document.title = 'Hello';\n}, []);\n\n// useLayoutEffect — runs before paint\nuseLayoutEffect(() => {\n  const height = ref.current.getBoundingClientRect().height;\n  setHeight(height);\n}, []);",
        follow_ups: [
          {
            question: 'When would you choose useLayoutEffect over useEffect?',
            answer: 'When you need to read layout from the DOM, for example element dimensions, and then update state or style before the user sees the painted result, to avoid a visual flash or flicker.',
          },
        ],
      },
      {
        id: 'q2',
        category: 'JavaScript',
        difficulty: 'easy',
        question: 'What is the difference between double equals and triple equals in JavaScript?',
        answer: 'Double equals performs loose equality with type coercion — it converts operands to the same type before comparing. Triple equals performs strict equality with no type coercion — operands must be the same type and value to be equal.',
        code_snippet: "console.log(0 == '0');  // true  (type coercion)\nconsole.log(0 === '0'); // false (strict, different types)",
      },
      {
        id: 'q3',
        category: 'CSS',
        difficulty: 'medium',
        question: 'Explain the CSS Box Model.',
        answer: 'The CSS Box Model describes the rectangular boxes generated for elements. From inside out: Content, which is the actual text or image; Padding, which is space inside the border; Border, which surrounds the padding; and Margin, which is space outside the border. By default, width and height set the content area. With box-sizing set to border-box, width and height include padding and border.',
      },
    ],
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

export function getTemplate(mode: ReadingMode): unknown {
  return templates[mode];
}

export function downloadTemplate(mode: ReadingMode): void {
  const data = templates[mode];
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${mode}-template.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Per-mode TTS writing rules injected into every AI prompt ─────────────────
// These rules are shared across all modes and enforce the TTS-clean standard.

const TTS_RULES = `
CRITICAL TTS WRITING RULES — you MUST follow all of these without exception:
1. No angle brackets in any text field. Do NOT write <T>, <div>, <input>, or any HTML or generic tags inside string values. Write "a type parameter T" or "the input element" instead.
2. No operator symbols in spoken text. Do NOT write ==, ===, =>, >=, <=, <, > as comparison tokens. Write "double equals", "triple equals", "greater than", "less than" instead.
3. No backtick-quoted or single-quoted code tokens in answer fields. Do NOT write 'interface', 'type', 'any', 'readonly', 'this', etc. Write them as plain words: interface, type, any, readonly, this.
4. No CSS shorthand notation. Do NOT write "display: none", "box-sizing: border-box" in answer text. Write "display none" or "box-sizing set to border-box".
5. No slashes in spoken text. Replace "width/height" with "width and height". Replace "relative/absolute" with "relative or absolute".
6. No special prefix notation. Replace "--var-name" with "double-dash prefix". Replace "$var-name" with "dollar-sign prefix".
7. No abbreviations. Replace "e.g." with "for example". Replace "i.e." with "that is". Replace "etc." with "and so on".
8. No spread syntax in text. Replace "(...)" with "three consecutive dots".
9. No empty JSX/template shorthand. Replace "<>" or "</>" with "the shorthand empty tag syntax".
10. The code_snippet field (interview mode only) is EXEMPT from these rules — it is display-only and never read aloud. All other fields must follow rules 1–9.
`;

// ─── Per-mode structure rules ─────────────────────────────────────────────────

function getModeStructureRules(mode: ReadingMode, count: number): string {
  switch (mode) {
    case 'flashcard':
      return `
STRUCTURE RULES for flashcard mode:
- Output a JSON array of exactly ${count} objects.
- Every object MUST have these fields: "id" (string, format "item-N"), "word" (string), "definition" (string), "example" (string), "category" (string).
- "definition": a clear, complete sentence definition suitable for reading aloud. No jargon without explanation.
- "example": a full, natural sentence showing the word in context.
- "category": a single descriptive category label (e.g. "Vocabulary", "Science", "History").
- Do NOT add any extra fields beyond those listed.`;

    case 'qa':
      return `
STRUCTURE RULES for qa mode:
- Output a JSON array of exactly ${count} objects.
- Every object MUST have these fields: "id" (string, format "item-N"), "question" (string), "answer" (string), "category" (string).
- You MAY optionally include "hint" (string) when a hint adds meaningful value.
- "question": a clear, complete question sentence.
- "answer": a thorough, self-contained explanation in 2–4 natural spoken sentences. No bullet points, no numbered lists.
- "hint": a short guiding nudge that does not give away the answer.
- "category": a single descriptive label.
- Do NOT add any extra fields beyond those listed.`;

    case 'article':
      return `
STRUCTURE RULES for article mode:
- Output a JSON array of exactly ${count} objects.
- Every object MUST have these fields: "id" (string, format "item-N"), "title" (string), "content" (string), "summary" (string), "category" (string).
- "title": a clear, descriptive title.
- "content": a full educational passage of at least 120 words. Written as flowing prose — no bullet points, no headers, no markdown. Natural spoken language only.
- "summary": 1–2 complete sentences summarising the key takeaway. Must be self-contained when read aloud.
- "category": a single descriptive label.
- Do NOT add any extra fields beyond those listed.`;

    case 'notes':
      return `
STRUCTURE RULES for notes mode:
- Output a JSON array of exactly ${count} objects.
- Every object MUST have these fields: "id" (string, format "item-N"), "topic" (string), "category" (string), "subtopics" (array).
- Each item in "subtopics" MUST have exactly: "heading" (string) and "body" (string).
- "topic": the main subject name.
- "subtopics": an array of 3–5 objects. Each "heading" is a concise section title. Each "body" is 2–3 complete spoken sentences explaining that section with no bullet points or symbols.
- "category": a single descriptive label.
- Do NOT add any extra fields beyond those listed.`;

    case 'mcq':
      return `
STRUCTURE RULES for mcq mode:
- Output a JSON array of exactly ${count} objects.
- Every object MUST have these fields: "id" (string, format "item-N"), "question" (string), "options" (array of exactly 4 strings), "correct_answer" (string), "explanation" (string), "category" (string).
- "question": a clear, complete question sentence.
- "options": exactly 4 plausible answer strings. Each option must be a complete noun phrase or sentence — no single letters (A, B, C, D).
- "correct_answer": must exactly match one of the strings in "options".
- "explanation": 2–3 complete spoken sentences explaining why the correct answer is right. Natural prose, no bullet points.
- "category": a single descriptive label.
- Do NOT add any extra fields beyond those listed.`;

    case 'interview':
      return `
STRUCTURE RULES for interview mode:
- Output a single JSON object (not an array) with these top-level fields: "role" (string), "level" (string), "questions" (array).
- "role": the job role, e.g. "${count > 0 ? 'Frontend Developer' : 'Software Engineer'}".
- "level": the seniority level, e.g. "Mid-level".
- "questions": an array of exactly ${count} question objects.
- Every question object MUST have: "id" (string, format "qN"), "category" (string), "difficulty" (one of: "easy", "medium", "hard"), "question" (string), "answer" (string).
- You MAY optionally include "code_snippet" (string) and "follow_ups" (array of objects with "question" and "answer" fields).
- "question": a clear interview question.
- "answer": a thorough model answer in 3–5 complete natural spoken sentences. This field MUST follow the TTS rules above — it is read aloud by a text-to-speech engine.
- "code_snippet": display-only. This field IS exempt from TTS rules — write real code here. Use single quotes inside strings to avoid breaking JSON.
- "difficulty": must be exactly one of the three allowed values.
- Do NOT add any extra fields beyond those listed.`;

    default:
      return '';
  }
}

export function getAIPrompt(mode: ReadingMode, topic: string, count: number): string {
  const data = templates[mode];
  const jsonSample = JSON.stringify(data, null, 2);

  let intro = '';
  switch (mode) {
    case 'flashcard':
      intro = `Generate ${count} flashcard items about "${topic}" for a study app that reads cards aloud using text-to-speech.`;
      break;
    case 'qa':
      intro = `Generate ${count} question-and-answer pairs about "${topic}" for a study app that reads questions and answers aloud using text-to-speech.`;
      break;
    case 'article':
      intro = `Generate ${count} short educational articles about "${topic}" for a reading app that reads content aloud using text-to-speech.`;
      break;
    case 'notes':
      intro = `Generate ${count} structured study notes about "${topic}" for a study app that reads note content aloud using text-to-speech.`;
      break;
    case 'mcq':
      intro = `Generate ${count} multiple-choice questions about "${topic}" for a quiz app that reads questions and options aloud using text-to-speech.`;
      break;
    case 'interview':
      intro = `Generate a mock interview deck with ${count} questions about "${topic}" for an interview prep app that reads questions and model answers aloud using text-to-speech.`;
      break;
    default:
      intro = `Generate ${count} learning items about "${topic}".`;
  }

  return `${intro}

OUTPUT FORMAT:
- Output ONLY raw, valid JSON. No markdown code fences, no backtick blocks, no explanations, no text before or after the JSON.
- Do NOT use double quotes inside any string value. Use single quotes inside strings if quoting is needed (e.g. in code_snippet).
- The output must be valid JSON that can be parsed directly with JSON.parse() with no modifications.

${TTS_RULES}
${getModeStructureRules(mode, count)}

REFERENCE EXAMPLE — your output must follow this exact structure:

${jsonSample}`;
}
