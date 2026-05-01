const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent,
  getLeaderboard,
  getDashboardStats,
} = require('../controllers/studentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public stats route (accessible after login)
router.get('/leaderboard', protect, getLeaderboard);
router.get('/dashboard-stats', protect, adminOnly, getDashboardStats);

// CRUD — Admin only for write operations
router.get('/', protect, adminOnly, getAllStudents);
router.get('/:id', protect, getStudentById);
router.post('/', protect, adminOnly, addStudent);
router.put('/:id', protect, adminOnly, updateStudent);
router.delete('/:id', protect, adminOnly, deleteStudent);

module.exports = router;
