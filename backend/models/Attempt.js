const mongoose = require('mongoose');

/**
 * Attempt Model
 * Links Student → Quiz via date
 * Compound unique index prevents duplicate attempts per student per day
 */
const attemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    // Array of selected option indices (0-indexed) per question
    answers: {
      type: [Number],
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    // Total questions in the quiz at time of attempt
    totalQuestions: {
      type: Number,
      required: true,
    },
    // Percentage score
    percentage: {
      type: Number,
      required: true,
    },
    // Date of attempt (date-only for streak logic)
    attemptDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent a student from attempting the same quiz twice
attemptSchema.index({ student: 1, quiz: 1 }, { unique: true });

module.exports = mongoose.model('Attempt', attemptSchema);
