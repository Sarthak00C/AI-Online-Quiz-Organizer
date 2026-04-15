import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Attempt } from '../models/Attempt.js';
import { Question } from '../models/Question.js';
import { Quiz } from '../models/Quiz.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();


// =======================
// SUBMIT QUIZ ATTEMPT
// =======================
router.post('/', authenticateToken, [
  body('quizId').notEmpty(),
  body('answers').isArray(),
  body('answers.*.questionId').notEmpty(),
  body('answers.*.selectedAnswer').isInt({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { quizId, answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const questions = await Question.find({ quizId });

    let score = 0;

    const answerMap = new Map(
      answers.map(a => [a.questionId.toString(), a.selectedAnswer])
    );

    const processedAnswers = [];

    for (const question of questions) {
      const selectedAnswer = answerMap.get(question._id.toString());

      if (selectedAnswer === question.correctAnswer) {
        score++;
      }

      processedAnswers.push({
        questionId: question._id,
        selectedAnswer: selectedAnswer ?? -1,
      });
    }

    const attempt = new Attempt({
      userId: req.user.id,
      quizId,
      score,
      totalQuestions: questions.length,
      answers: processedAnswers,
      completedAt: new Date(),
    });

    await attempt.save();

    res.status(201).json({
      attempt: {
        id: attempt._id,
        userId: attempt.userId,
        quizId: attempt.quizId,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        completedAt: attempt.completedAt,
      },
    });

  } catch (error) {
    console.error('Submit attempt error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});


// =======================
// GET USER ATTEMPTS
// =======================
router.get('/', authenticateToken, async (req, res) => {
  try {
    const attempts = await Attempt.find({ userId: req.user.id })
      .populate('quizId', 'title quizCode')
      .sort({ createdAt: -1 });

    res.json({
      attempts: attempts.map(attempt => ({
        id: attempt._id,
        quiz: {
          id: attempt.quizId._id,
          title: attempt.quizId.title,
          quizCode: attempt.quizId.quizCode,
        },
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: Math.round(
          (attempt.score / attempt.totalQuestions) * 100
        ),
        completedAt: attempt.completedAt,
      })),
    });

  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ error: 'Failed to get attempts' });
  }
});


// =======================
// LEADERBOARD (FIXED)
// =======================
router.get('/quiz/:quizCode/leaderboard', authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      quizCode: req.params.quizCode.toUpperCase(),
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const attempts = await Attempt.find({ quizId: quiz._id })
      .populate('userId', 'name email') // ✅ IMPORTANT
      .sort({ score: -1, completedAt: -1 });

    const leaderboard = new Map();

    for (const attempt of attempts) {
      const userId = attempt.userId._id.toString();

      if (!leaderboard.has(userId)) {
        leaderboard.set(userId, {
          userId,
          name: attempt.userId.name || "Anonymous", // ✅ FIXED
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: Math.round(
            (attempt.score / attempt.totalQuestions) * 100
          ),
          completedAt: attempt.completedAt,
        });
      }
    }

    const sortedLeaderboard = Array.from(leaderboard.values())
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 100);

    res.json({ leaderboard: sortedLeaderboard });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});


// =======================
// GET SINGLE ATTEMPT
// =======================
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('quizId')
      .populate('userId', 'name email');

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    if (attempt.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Cannot view other user attempts' });
    }

    res.json({
      attempt: {
        id: attempt._id,
        user: {
          name: attempt.userId.name,
          email: attempt.userId.email,
        },
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: Math.round(
          (attempt.score / attempt.totalQuestions) * 100
        ),
        answers: attempt.answers,
        completedAt: attempt.completedAt,
      },
    });

  } catch (error) {
    console.error('Get attempt error:', error);
    res.status(500).json({ error: 'Failed to get attempt' });
  }
});

export default router;