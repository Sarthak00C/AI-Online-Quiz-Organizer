import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Groq from 'groq-sdk';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// ✅ Groq setup
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post(
  '/generate-quiz',
  authenticateToken,
  [
    body('prompt').trim().notEmpty().withMessage('Prompt is required'),
    body('topic').optional({ checkFalsy: true }).trim(),
    body('difficulty')
      .optional({ checkFalsy: true })
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Difficulty must be easy, medium, or hard'),
    body('count')
      .optional({ checkFalsy: true })
      .isInt({ min: 1, max: 10 })
      .withMessage('Count must be between 1 and 10'),
  ],
  async (req, res) => {
    try {
      // ✅ Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { prompt, topic, difficulty, count } = req.body;

      const resolvedTopic = topic || prompt;
      const resolvedDifficulty = difficulty || 'medium';
      const resolvedCount = parseInt(count) || 5;

      // ✅ Same strong prompt
      const finalPrompt = `
You are a STRICT quiz generator.

TASK:
Generate exactly ${resolvedCount} multiple-choice questions based ONLY on the given topic.

TOPIC:
"${prompt}"

RULES:
- Questions MUST strictly belong to this topic
- DO NOT generate unrelated or general knowledge questions
- If topic is short or ambiguous, assume its most common meaning
- Each question must have exactly 4 options
- Only ONE correct answer
- Difficulty: ${resolvedDifficulty}

IMPORTANT:
Return ONLY a JSON array. No explanation, no text, no markdown.

FORMAT:
[
  {
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0
  }
]
`;

      // Groq API call
      const completion = await groq.chat.completions.create({
        model: "llama-3.1-8b-instant", // fast + free
        messages: [
          {
            role: "user",
            content: finalPrompt,
          },
        ],
      });

      const responseText =
        completion.choices?.[0]?.message?.content || "";

      console.log("AI RAW RESPONSE:\n", responseText);

      // Clean markdown
      const cleaned = responseText
        .replace(/```json|```/g, '')
        .trim();

      // Extract JSON safely
      const match = cleaned.match(/\[\s*{[\s\S]*}\s*\]/);

      if (!match) {
        console.error("AI BAD RESPONSE:\n", cleaned);
        throw new Error("No valid JSON found");
      }

      let questions;

      try {
        questions = JSON.parse(match[0]);
      } catch (err) {
        console.error("JSON PARSE ERROR:\n", match[0]);
        throw err;
      }

      // Validate
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Invalid format");
      }

      return res.json({
        title: `Quiz: ${resolvedTopic}`,
        topic: resolvedTopic,
        difficulty: resolvedDifficulty,
        questions,
      });

    } catch (error) {
      console.error("Groq AI error:", error);

      return res.json({
        title: "Error",
        topic: "Error",
        questions: [
          {
            question: "Failed to generate quiz",
            options: ["Retry", "Check API", "Server Error", "Unknown"],
            correctAnswer: 0,
          },
        ],
      });
    }
  }
);

export default router;