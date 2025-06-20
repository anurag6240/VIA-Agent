import stringSimilarity from 'string-similarity';

const INTERVIEW_KEYWORDS = [
  // Question triggers
  'what', 'how', 'why', 'when', 'where', 'who', 'which', 'can you',
  'could you', 'would you', 'do you', 'did you', 'explain', 'describe', 'tell me', 'tell about',
  'reason', 'use', 'purpose', 'need', 'benefit', 'scope', 'career in',

  // Technical domains
  'react', 'angular', 'vue', 'next', 'node', 'express', 'mongodb', 'firebase',
  'python', 'java', 'c++', 'c#', 'javascript', 'typescript', 'flutter', 'android', 'swift',
  'html', 'css', 'sass', 'tailwind', 'redux', 'graphql', 'api', 'rest', 'jwt',

  // CS fundamentals
  'algorithm', 'data structure', 'array', 'linked list', 'tree', 'graph', 'hashmap', 'stack', 'queue',
  'database', 'sql', 'nosql', 'index', 'normalization', 'join', 'query', 'transaction',

  // Software concepts
  'oop', 'object oriented', 'inheritance', 'encapsulation', 'polymorphism', 'abstraction',
  'design pattern', 'solid', 'mvc', 'architecture',

  // DevOps & tools
  'devops', 'docker', 'kubernetes', 'ci/cd', 'git', 'github', 'version control',

  // Soft/HR topics
  'project', 'internship', 'experience', 'skills', 'challenge', 'problem',
  'strength', 'weakness', 'goal', 'plan', 'teamwork', 'communication',

  // Indian-specific spoken cues
  'difference', 'compare', 'vs', 'value', 'importance', 'meaning', 'overview',
  'future', 'trending', 'growth', 'placement', 'interview', 'job role',
  'is it important', 'should I learn', 'what to choose', 'can I get job with',

  // Buzzwords
  'ai', 'ml', 'blockchain', 'cloud', 'data science', 'cybersecurity', 'big data',
  'web development', 'full stack', 'frontend', 'backend', 'testing', 'bug', 'performance',

  // Indian/casual/educational question styles
  'define', 'definition', 'meaning of', 'short note', 'explain in short', 'full form', 'expand', 'elaborate',
  'what do you mean by', 'importance of', 'role of', 'uses of', 'advantages', 'disadvantages', 'pros', 'cons',
  'merits', 'demerits', 'explain with example', 'difference between', 'types of', 'list out', 'write about',
  'note on', 'explain briefly', 'in detail', 'explain in hindi', 'explain in simple words',
  'explain', 'explaination', 'explaination of', 'explaination in', 'explaination about',
  'explain like this', 'define like this', 'define in simple words', 'define in hindi',
  'explain with diagram', 'explain step by step', 'write short note', 'write a note',
  'write answer', 'write explanation', 'write the answer', 'write the explanation',
  'give example', 'give an example', 'give a short note', 'give a note',
  'pros and cons', 'advantages and disadvantages', 'merits and demerits',
  'types', 'kinds', 'forms', 'categories', 'explain types', 'explain kinds',
  'difference', 'difference of', 'difference in', 'difference with', 'difference among',
  'compare', 'comparison', 'comparison between', 'comparison of',
  'uses', 'applications', 'application', 'purpose', 'importance', 'role',
  'scope', 'future scope', 'career scope', 'job scope',
  'write', 'write about', 'write on', 'write a note on',
  'note', 'note on', 'note about', 'note in',
  'explain with example', 'explain with diagram', 'explain with points',
  'explain stepwise', 'explain step by step',
];

const QUESTION_PATTERNS = [
  // Core English patterns
  /what\s+(is|are|do|does|did|will|would|can|should)\s+([a-zA-Z0-9_.-]{3,})/i,
  /how\s+(do|does|did|will|would|can|should|to|we|it)\s+([a-zA-Z0-9_.-]{3,})/i,
  /why\s+(do|does|did|is|are|will|should|we|people)\s+([a-zA-Z0-9_.-]{3,})/i,
  /where\s+(is|can|do|does|should|can we)\s+([a-zA-Z0-9_.-]{3,})/i,
  /when\s+(do|does|did|should|to|can)\s+([a-zA-Z0-9_.-]{3,})/i,
  /can\s+(you|we)\s+(explain|tell|describe|show)\s+([a-zA-Z0-9_.-]{3,})/i,
  /could\s+(you|we)\s+(tell|explain|give)\s+([a-zA-Z0-9_.-]{3,})/i,
  /would\s+(you|we)\s+(say|consider|prefer)\s+([a-zA-Z0-9_.-]{3,})/i,
  /tell\s+(me\s+)?about\s+([a-zA-Z0-9_.-]{3,})/i,
  /explain\s+(me\s+)?(about|how|what)\s+([a-zA-Z0-9_.-]{3,})/i,
  /describe\s+(me\s+)?(the|how|what|process)\s+([a-zA-Z0-9_.-]{3,})/i,

  // Casual spoken variations (Indian culture)
  /what's\s+(the\s+)?use\s+of\s+([a-zA-Z0-9_.-]{3,})/i,
  /why\s+we\s+use\s+([a-zA-Z0-9_.-]{3,})/i,
  /how\s+it\s+works\s+([a-zA-Z0-9_.-]{3,})/i,
  /what\s+for\s+it\s+is\s+([a-zA-Z0-9_.-]{3,})/i,
  /what\s+is\s+the\s+difference\s+([a-zA-Z0-9_.-]{3,})/i,
  /difference\s+(between|of)\s+([a-zA-Z0-9_.-]{3,})/i,
  /compare\s+.*\s+(with|and|vs)\s+([a-zA-Z0-9_.-]{3,})/i,
  /can\s+I\s+(learn|get|use|do)\s+([a-zA-Z0-9_.-]{3,})/i,
  /is\s+(this|it|that)\s+(important|useful|needed)\s+([a-zA-Z0-9_.-]{3,})/i,
  /which\s+one\s+is\s+(better|good|faster)\s+([a-zA-Z0-9_.-]{3,})/i,
  /what\s+to\s+(choose|learn|study)\s+([a-zA-Z0-9_.-]{3,})/i,
  /how\s+to\s+(start|learn|prepare|crack)\s+([a-zA-Z0-9_.-]{3,})/i,
  /scope\s+of\s+([a-zA-Z0-9_.-]{3,})/i,
  /career\s+in\s+([a-zA-Z0-9_.-]{3,})/i,
  /interview\s+question\s+([a-zA-Z0-9_.-]{3,})/i,

  // Indian/casual/educational question styles
  /define\s+([a-zA-Z0-9_.-]{3,})/i,
  /definition\s+of\s+([a-zA-Z0-9_.-]{3,})/i,
  /what\s+is\s+([a-zA-Z0-9_.-]{3,})/i,
  /what\s+do\s+you\s+mean\s+by\s+([a-zA-Z0-9_.-]{3,})/i,
  /meaning\s+of\s+([a-zA-Z0-9_.-]{3,})/i,
  /explain\s+in\s+(short|detail|hindi|simple words)\s+([a-zA-Z0-9_.-]{3,})/i,
  /give\s+(an\s+)?example\s+of\s+([a-zA-Z0-9_.-]{3,})/i,
  /write\s+a?\s+short\s+note\s+on\s+([a-zA-Z0-9_.-]{3,})/i,
  /list\s+(out|the)\s+([a-zA-Z0-9_.-]{3,})/i,
  /types\s+of\s+([a-zA-Z0-9_.-]{3,})/i,
  /advantages\s+and\s+disadvantages\s+of\s+([a-zA-Z0-9_.-]{3,})/i,
  /pros\s+and\s+cons\s+of\s+([a-zA-Z0-9_.-]{3,})/i,
  /merits\s+and\s+demerits\s+of\s+([a-zA-Z0-9_.-]{3,})/i,
  /explain\s+with\s+(example|diagram|points)\s+([a-zA-Z0-9_.-]{3,})/i,
  /explain\s+step(\s+by\s+step|wise)?\s+([a-zA-Z0-9_.-]{3,})/i,
  /difference\s+(between|of|in|with|among)\s+([a-zA-Z0-9_.-]{3,})/i,
  /compare\s+(with|and|between|of)\s+([a-zA-Z0-9_.-]{3,})/i,
  /write\s+(about|on|a\s+note\s+on|the\s+answer|the\s+explanation)\s+([a-zA-Z0-9_.-]{3,})/i,
  /note\s+(on|about|in)\s+([a-zA-Z0-9_.-]{3,})/i,
  /scope\s+of\s+([a-zA-Z0-9_.-]{3,})/i,
  /future\s+scope\s+of\s+([a-zA-Z0-9_.-]{3,})/i,
  /career\s+scope\s+of\s+([a-zA-Z0-9_.-]{3,})/i,
  /job\s+scope\s+of\s+([a-zA-Z0-9_.-]{3,})/i,

  // Strong definition triggers
  /define\s+[a-zA-Z0-9_.-]+/i,
  /definition\s+of\s+[a-zA-Z0-9_.-]+/i,
  /what\s+is\s+[a-zA-Z0-9_.-]+/i,
  /what\s+do\s+you\s+mean\s+by\s+[a-zA-Z0-9_.-]+/i,
  /meaning\s+of\s+[a-zA-Z0-9_.-]+/i,
];

export const isInterviewQuestion = (text: string): boolean => {
  const lowerText = text.toLowerCase().trim();

  if (lowerText.length < 5) return false;

  // Strong definition triggers: if any match, return true only if a real subject follows
  const strongDefinitionPatterns = [
    /define\s+([a-zA-Z0-9_.-]{3,})/i,
    /definition\s+of\s+([a-zA-Z0-9_.-]{3,})/i,
    /what\s+is\s+([a-zA-Z0-9_.-]{3,})/i,
    /what\s+do\s+you\s+mean\s+by\s+([a-zA-Z0-9_.-]{3,})/i,
    /meaning\s+of\s+([a-zA-Z0-9_.-]{3,})/i,
  ];
  for (const pattern of strongDefinitionPatterns) {
    const match = lowerText.match(pattern);
    if (match && match[1] && match[1].length > 2) {
      return true;
    }
  }

  // Prevent processing if only a trigger word/phrase is present
  const onlyTriggerPhrases = [
    /^define\s*$/i,
    /^definition\s*$/i,
    /^what\s+is\s*$/i,
    /^what\s+do\s+you\s+mean\s+by\s*$/i,
    /^meaning\s+of\s*$/i,
  ];
  if (onlyTriggerPhrases.some((pattern) => pattern.test(lowerText))) {
    return false;
  }

  const hasQuestionPattern = QUESTION_PATTERNS.some((pattern) =>
    pattern.test(lowerText)
  );

  // Split input into words for fuzzy matching
  const words = lowerText.split(/\s+/);
  let fuzzyMatches = 0;
  for (const word of words) {
    const { bestMatch } = stringSimilarity.findBestMatch(word, INTERVIEW_KEYWORDS);
    if (bestMatch.rating > 0.7) {
      fuzzyMatches++;
    }
  }

  const keywordMatches = INTERVIEW_KEYWORDS.filter((keyword) =>
    lowerText.includes(keyword)
  ).length;

  // Adjust threshold for better fuzzy matching
  return hasQuestionPattern || keywordMatches >= 2 || fuzzyMatches >= 2;
};

export const cleanQuestion = (text: string): string => {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[?]+$/, '?')
    .replace(/^(um|uh|well|so|okay|like|hmm|actually|basically)\s+/i, '')
    .replace(/[^a-zA-Z0-9 ?]/g, '') // remove junk characters
    .trim();
};

export function autoCorrectText(text: string): string {
  return text.split(/\s+/).map(word => {
    const { bestMatch } = stringSimilarity.findBestMatch(word, INTERVIEW_KEYWORDS);
    return bestMatch.rating > 0.7 ? bestMatch.target : word;
  }).join(' ');
}

export { INTERVIEW_KEYWORDS };
