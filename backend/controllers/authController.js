const Student = require('../models/Student');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route  POST /api/auth/login
// @desc   Login student or admin
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find student (includes password for comparison)
    const student = await Student.findOne({ email }).select('+password');
    if (!student) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(student._id, student.role);

    res.status(200).json({
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        rollNumber: student.rollNumber,
        course: student.course,
        year: student.year,
        streak: student.streak,
        quizzesTaken: student.quizzesTaken,
        totalScore: student.totalScore,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @route  GET /api/auth/me
// @desc   Get currently logged-in user
// @access Private
const getMe = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, getMe };
