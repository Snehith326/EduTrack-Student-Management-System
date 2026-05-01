const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const Student = require('../models/Student');

// Helper: get today's date range (midnight to midnight)
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

// ─────────────────────────────────────────────
// @route  GET /api/quizzes/today
// @desc   Get today's quiz (student)
// @access Private
// ─────────────────────────────────────────────
const getTodayQuiz = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    const quiz = await Quiz.findOne({ date: { $gte: start, $lt: end } });
    if (!quiz) {
      return res.status(404).json({ message: 'No quiz scheduled for today' });
    }

    // Check if this student already attempted
    const alreadyAttempted = await Attempt.findOne({
      student: req.user.id,
      quiz: quiz._id,
    });

    // Return quiz WITHOUT correct answers to prevent cheating
    const safeQuiz = {
      _id: quiz._id,
      date: quiz.date,
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        // correctAnswer NOT sent to client
      })),
      alreadyAttempted: !!alreadyAttempted,
      attemptDetails: alreadyAttempted || null,
    };

    res.status(200).json(safeQuiz);
  } catch (error) {
    console.error('Get today quiz error:', error);
    res.status(500).json({ message: 'Server error fetching quiz' });
  }
};

// ─────────────────────────────────────────────
// @route  POST /api/quizzes/submit
// @desc   Submit quiz answers — calculates score, updates streak
// @access Private (Student)
// ─────────────────────────────────────────────
const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const studentId = req.user.id;

    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'quizId and answers array required' });
    }

    // Verify quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Prevent duplicate attempt (also enforced by DB index)
    const existingAttempt = await Attempt.findOne({ student: studentId, quiz: quizId });
    if (existingAttempt) {
      return res.status(409).json({ message: 'You have already attempted this quiz today' });
    }

    // ── Score Calculation ──────────────────────
    let score = 0;
    const results = quiz.questions.map((q, idx) => {
      const isCorrect = answers[idx] === q.correctAnswer;
      if (isCorrect) score++;
      return {
        question: q.question,
        selectedAnswer: answers[idx],
        correctAnswer: q.correctAnswer,
        isCorrect,
      };
    });

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    // ── Streak Logic ───────────────────────────
    const student = await Student.findById(studentId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let newStreak = 1; // Default: first attempt ever or reset
    if (student.lastAttemptDate) {
      const lastDate = new Date(student.lastAttemptDate);
      lastDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        // Consecutive day — increment streak
        newStreak = student.streak + 1;
      } else if (diffDays === 0) {
        // Same day (should not reach here due to duplicate check)
        newStreak = student.streak;
      } else {
        // Missed one or more days — reset
        newStreak = 1;
      }
    }

    // ── Save Attempt ───────────────────────────
    const attempt = await Attempt.create({
      student: studentId,
      quiz: quizId,
      answers,
      score,
      totalQuestions,
      percentage,
      attemptDate: today,
    });

    // ── Update Student Stats ───────────────────
    await Student.findByIdAndUpdate(studentId, {
      streak: newStreak,
      lastAttemptDate: today,
      $inc: { totalScore: percentage, quizzesTaken: 1 },
    });

    res.status(201).json({
      message: 'Quiz submitted successfully!',
      score,
      totalQuestions,
      percentage,
      streak: newStreak,
      results,
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    // Handle unique index violation gracefully
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already attempted this quiz today' });
    }
    res.status(500).json({ message: 'Server error submitting quiz' });
  }
};

// ─────────────────────────────────────────────
// @route  POST /api/quizzes
// @desc   Admin creates today's quiz
// @access Private (Admin)
// ─────────────────────────────────────────────
const createQuiz = async (req, res) => {
  try {
    const { date, questions } = req.body;

    if (!questions || questions.length < 3 || questions.length > 5) {
      return res.status(400).json({ message: 'Please provide 3–5 questions' });
    }

    // Parse the date (defaults to today)
    const quizDate = date ? new Date(date) : new Date();
    quizDate.setHours(0, 0, 0, 0);

    // Check if quiz already exists for that date
    const existing = await Quiz.findOne({
      date: { $gte: quizDate, $lt: new Date(quizDate.getTime() + 86400000) },
    });
    if (existing) {
      return res.status(409).json({ message: 'A quiz already exists for that date' });
    }

    const quiz = await Quiz.create({
      date: quizDate,
      questions,
      addedBy: req.user.id,
    });

    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Server error creating quiz' });
  }
};

// ─────────────────────────────────────────────
// @route  GET /api/quizzes
// @desc   Admin — get all quizzes
// @access Private (Admin)
// ─────────────────────────────────────────────
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ date: -1 }).limit(30);
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// @route  GET /api/quizzes/analytics/:studentId
// @desc   Full performance analytics for a student
// @access Private
// ─────────────────────────────────────────────
const getStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;

    const attempts = await Attempt.find({ student: studentId })
      .populate('quiz', 'date questions')
      .sort({ attemptDate: 1 });

    if (attempts.length === 0) {
      return res.status(200).json({
        attempts: [],
        avgScore: 0,
        participationPct: 0,
        scoreHistory: [],
      });
    }

    // Total quizzes ever created (for participation %)
    const totalQuizzes = await Quiz.countDocuments();

    const avgScore =
      attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length;

    const participationPct =
      totalQuizzes > 0
        ? Math.round((attempts.length / totalQuizzes) * 100)
        : 0;

    const scoreHistory = attempts.map((a) => ({
      date: a.attemptDate,
      score: a.score,
      percentage: a.percentage,
      totalQuestions: a.totalQuestions,
    }));

    res.status(200).json({
      attempts,
      avgScore: avgScore.toFixed(1),
      participationPct,
      scoreHistory,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

module.exports = {
  getTodayQuiz,
  submitQuiz,
  createQuiz,
  getAllQuizzes,
  getStudentAnalytics,
};
