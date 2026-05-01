const Student = require('../models/Student');
const Attempt = require('../models/Attempt');

// ─────────────────────────────────────────────
// @route  GET /api/students
// @desc   Get all students (with optional search/filter)
// @access Private (Admin)
// ─────────────────────────────────────────────
const getAllStudents = async (req, res) => {
  try {
    const { search, course, year } = req.query;

    // Build dynamic filter query
    const filter = { role: 'student' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (course) filter.course = course;
    if (year) filter.year = year;

    const students = await Student.find(filter).select('-password').sort({ createdAt: -1 });

    res.status(200).json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error fetching students' });
  }
};

// ─────────────────────────────────────────────
// @route  GET /api/students/:id
// @desc   Get single student + their attempt history
// @access Private
// ─────────────────────────────────────────────
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Fetch all attempts for analytics
    const attempts = await Attempt.find({ student: req.params.id })
      .populate('quiz', 'date questions')
      .sort({ attemptDate: -1 });

    const avgScore =
      attempts.length > 0
        ? (
            attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
          ).toFixed(1)
        : 0;

    res.status(200).json({ student, attempts, avgScore });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error fetching student' });
  }
};

// ─────────────────────────────────────────────
// @route  POST /api/students
// @desc   Add a new student (Admin only)
// @access Private (Admin)
// ─────────────────────────────────────────────
const addStudent = async (req, res) => {
  try {
    const { name, rollNumber, email, course, year, password } = req.body;

    if (!name || !rollNumber || !email || !course || !year || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check for duplicates
    const existing = await Student.findOne({
      $or: [{ email }, { rollNumber }],
    });
    if (existing) {
      return res.status(409).json({
        message:
          existing.email === email
            ? 'Email already registered'
            : 'Roll number already exists',
      });
    }

    // Password is hashed via pre-save hook in the model
    const student = await Student.create({
      name,
      rollNumber,
      email,
      course,
      year,
      password,
      role: 'student',
    });

    res.status(201).json({
      message: 'Student added successfully',
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        course: student.course,
        year: student.year,
      },
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ message: 'Server error adding student' });
  }
};

// ─────────────────────────────────────────────
// @route  PUT /api/students/:id
// @desc   Update student details
// @access Private (Admin)
// ─────────────────────────────────────────────
const updateStudent = async (req, res) => {
  try {
    const { name, rollNumber, email, course, year } = req.body;

    // Check duplicate roll/email for OTHER students
    if (rollNumber || email) {
      const conflict = await Student.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(email ? [{ email }] : []),
          ...(rollNumber ? [{ rollNumber }] : []),
        ],
      });
      if (conflict) {
        return res.status(409).json({
          message: 'Email or Roll Number already used by another student',
        });
      }
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, rollNumber, email, course, year },
      { new: true, runValidators: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ message: 'Student updated successfully', student });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error updating student' });
  }
};

// ─────────────────────────────────────────────
// @route  DELETE /api/students/:id
// @desc   Delete student and their attempts
// @access Private (Admin)
// ─────────────────────────────────────────────
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Clean up all attempts for this student
    await Attempt.deleteMany({ student: req.params.id });

    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error deleting student' });
  }
};

// ─────────────────────────────────────────────
// @route  GET /api/students/leaderboard
// @desc   Top students by streak and score
// @access Private
// ─────────────────────────────────────────────
const getLeaderboard = async (req, res) => {
  try {
    const students = await Student.find({ role: 'student' })
      .select('name rollNumber course streak totalScore quizzesTaken')
      .sort({ streak: -1, totalScore: -1 })
      .limit(10);

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching leaderboard' });
  }
};

// ─────────────────────────────────────────────
// @route  GET /api/students/dashboard-stats
// @desc   Dashboard summary for admin
// @access Private (Admin)
// ─────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ role: 'student' });

    // Quizzes taken today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const quizzesToday = await Attempt.countDocuments({
      attemptDate: { $gte: today, $lt: tomorrow },
    });

    // Top performer (highest average %)
    const topPerformer = await Student.findOne({ role: 'student', quizzesTaken: { $gt: 0 } })
      .select('name rollNumber totalScore quizzesTaken streak')
      .sort({ totalScore: -1 })
      .lean();

    // Highest streak
    const highestStreakStudent = await Student.findOne({ role: 'student' })
      .select('name streak rollNumber')
      .sort({ streak: -1 })
      .lean();

    res.status(200).json({
      totalStudents,
      quizzesToday,
      topPerformer: topPerformer
        ? {
            ...topPerformer,
            avgScore:
              topPerformer.quizzesTaken > 0
                ? (topPerformer.totalScore / topPerformer.quizzesTaken).toFixed(1)
                : 0,
          }
        : null,
      highestStreakStudent,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent,
  getLeaderboard,
  getDashboardStats,
};
