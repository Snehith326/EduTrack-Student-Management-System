const mongoose = require('mongoose');

/**
 * Quiz Model
 * Each document = one daily quiz with multiple questions
 * One quiz per day enforced by unique date index
 */
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => arr.length === 4,
      message: 'Each question must have exactly 4 options',
    },
  },
  // 0-indexed: 0=A, 1=B, 2=C, 3=D
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
});

const quizSchema = new mongoose.Schema(
  {
    // Store only the date portion (YYYY-MM-DD) for easy daily lookup
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 3 && arr.length <= 5,
        message: 'A quiz must have 3–5 questions',
      },
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
