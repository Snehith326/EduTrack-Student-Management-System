const express = require('express');
const router = express.Router();
const {
  getTodayQuiz,
  submitQuiz,
  createQuiz,
  getAllQuizzes,
  getStudentAnalytics,
} = require('../controllers/quizController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Student routes
router.get('/today', protect, getTodayQuiz);
router.post('/submit', protect, submitQuiz);
router.get('/analytics/:studentId', protect, getStudentAnalytics);

// Admin routes
router.post('/', protect, adminOnly, createQuiz);
router.get('/', protect, adminOnly, getAllQuizzes);

module.exports = router;
