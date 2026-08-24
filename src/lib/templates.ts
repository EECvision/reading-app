import type { ReadingMode } from '@/types';

// ─── Template data for each mode ─────────────────────────────────────────────

const templates: Record<ReadingMode, unknown> = {
  flashcard: [
    { id: 'item-0', word: 'Ephemeral', definition: 'Lasting for a very short time.', example: 'The ephemeral nature of fame.', category: 'Vocabulary' },
    { id: 'item-1', word: 'Ubiquitous', definition: 'Present, appearing, or found everywhere.', example: 'Mobile phones are now ubiquitous.', category: 'Vocabulary' },
  ],

  qa: [
    { id: 'item-0', question: 'What is osmosis?', answer: 'The movement of water molecules through a semi-permeable membrane from a region of lower solute concentration to a region of higher solute concentration.', hint: 'Think semi-permeable membrane.', category: 'Biology' },
    { id: 'item-1', question: 'What is the speed of light in a vacuum?', answer: 'Approximately 299,792,458 metres per second (≈ 3 × 10⁸ m/s).', category: 'Physics' },
  ],

  article: [
    {
      id: 'item-0',
      title: 'The Rise of Artificial Intelligence',
      content: 'Artificial Intelligence (AI) has transformed from a niche academic field into one of the most influential forces shaping modern society. Early AI research in the 1950s focused on symbolic reasoning and rule-based systems. Today, deep learning and large language models have enabled AI to perform tasks once thought exclusive to humans — from writing and coding to medical diagnosis and creative arts. The pace of progress raises both exciting possibilities and important ethical questions about automation, bias, and the future of work.',
      summary: 'AI has grown from academic curiosity to a transformative societal force, driven by deep learning.',
      category: 'Technology',
    },
  ],

  notes: [
    {
      id: 'item-0',
      topic: 'Photosynthesis',
      category: 'Biology',
      subtopics: [
        { heading: 'Light-Dependent Reactions', body: 'Occur in the thylakoid membranes. Water is split (photolysis), oxygen is released, and ATP and NADPH are produced.' },
        { heading: 'Calvin Cycle (Light-Independent)', body: 'Occurs in the stroma. Uses ATP and NADPH to fix CO₂ into glucose via the enzyme RuBisCO.' },
        { heading: 'Overall Equation', body: '6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂' },
      ],
    },
  ],

  mcq: [
    {
      id: 'item-0',
      question: 'Which gas do plants primarily absorb during photosynthesis?',
      options: ['O₂', 'CO₂', 'N₂', 'H₂'],
      correct_answer: 'CO₂',
      explanation: 'Plants use carbon dioxide (CO₂) as a raw material in the Calvin Cycle to produce glucose.',
      category: 'Biology',
    },
    {
      id: 'item-1',
      question: 'What does HTTP stand for?',
      options: ['HyperText Transfer Protocol', 'High Transfer Text Protocol', 'Hyperlink Text Transmission Protocol', 'HyperText Transmission Path'],
      correct_answer: 'HyperText Transfer Protocol',
      explanation: 'HTTP (HyperText Transfer Protocol) is the foundation of data communication on the World Wide Web.',
      category: 'Computer Science',
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
            answer: 'When you need to read layout from the DOM (e.g. element dimensions) and then update state or style before the user sees the painted result, to avoid a visual flash or flicker.',
          },
        ],
      },
      {
        id: 'q2',
        category: 'JavaScript',
        difficulty: 'easy',
        question: 'What is the difference between == and === in JavaScript?',
        answer: '== performs loose equality with type coercion — it converts operands to the same type before comparing. === performs strict equality with no type coercion — operands must be the same type and value to be equal.',
        code_snippet: "console.log(0 == '0');  // true  (type coercion)\nconsole.log(0 === '0'); // false (strict, different types)",
      },
      {
        id: 'q3',
        category: 'CSS',
        difficulty: 'medium',
        question: 'Explain the CSS Box Model.',
        answer: 'The CSS Box Model describes the rectangular boxes generated for elements. From inside out: Content (the actual text/image), Padding (space inside the border), Border (surrounds padding), and Margin (space outside the border). By default, width/height set the content area. With box-sizing: border-box, width/height include padding and border.',
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

export function getAIPrompt(mode: ReadingMode, topic: string, count: number): string {
  const data = templates[mode];
  const jsonSample = JSON.stringify(data, null, 2);
  
  return `I am creating a study deck for a flashcard and quiz app. Please generate ${count} ${mode} items about "${topic}".

You must output ONLY raw, valid JSON. Do not include any markdown formatting, explanations, or text outside of the JSON array. You must strictly follow this exact JSON structure:

${jsonSample}`;
}
