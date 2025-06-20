const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-06-17:generateContent';

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export const generateAnswer = async (question: string): Promise<string> => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
    throw new Error(
      'Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.'
    );
  }

  const prompt = `You're a senior full-stack developer. Answer only from inside the box.
Format your answer in markdown, with these sections:

---

**📝 Overview**
- 5-6 simple sentences, in simple language or if needed, then small code snippets for only the most important parts.

**✅ Advantages**
- List exactly 2 short, clear points.

**❌ Disadvantages**
- List exactly 2 short, clear points.

Fix small tech term typos errors (e.g., "nust js" → "Next.js") silently. Keep it short, concise, including the tech term in the answer.

Interview Question: "${question}"`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.6,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 300,
          candidateCount: 1,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
      );
    }

    const data: GeminiResponse = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('No valid response received from Gemini API');
    }

    let cleanedAnswer = data.candidates[0].content.parts[0].text.trim();

    // Normalize line endings
    cleanedAnswer = cleanedAnswer.replace(/\r\n/g, '\n');

    // Trim trailing spaces on each line
    cleanedAnswer = cleanedAnswer
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n');

    // Ensure 1 blank line after Overview
    cleanedAnswer = cleanedAnswer.replace(
      /(\*\*?📝 Overview\*\*?\n[\s\S]*?)(?=\n\*\*?✅ Advantages\*\*?)/,
      (_, p1) => p1.trimEnd() + '\n\n'
    );

    // Ensure 1 blank line after Advantages
    cleanedAnswer = cleanedAnswer.replace(
      /(\*\*?✅ Advantages\*\*?\n(?:[-*].+\n?)+)(?=\s*\*\*?❌ Disadvantages\*\*?)/,
      (_, p1) => p1.trimEnd() + '\n\n'
    );

    // Remove multiple newlines
    cleanedAnswer = cleanedAnswer.replace(/\n{3,}/g, '\n\n');

    // Remove code block wrappers
    cleanedAnswer = cleanedAnswer.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');

    // Final trim
    return cleanedAnswer.trim();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate answer. Please try again.');
  }
};
