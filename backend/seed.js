/**
 * seed.js — Run once to populate the database
 * Usage: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Quiz = require('./models/Quiz');

const STUDENTS = [
  { name: 'Admin User',     rollNumber: 'ADMIN001', email: 'admin@edutrack.com', course: 'Computer Science', year: '4th', password: 'admin123', role: 'admin' },
  { name: 'Alice Johnson',  rollNumber: 'CS2024001', email: 'alice@college.edu', course: 'Computer Science', year: '3rd', password: 'student123' },
  { name: 'Bob Sharma',     rollNumber: 'ME2024002', email: 'bob@college.edu',   course: 'Mechanical',       year: '2nd', password: 'student123' },
  { name: 'Charlie Verma',  rollNumber: 'EE2024003', email: 'charlie@college.edu', course: 'Electrical',    year: '4th', password: 'student123' },
  { name: 'Diana Patel',    rollNumber: 'CS2024004', email: 'diana@college.edu', course: 'Computer Science', year: '1st', password: 'student123' },
  { name: 'Ethan Gupta',    rollNumber: 'CI2024005', email: 'ethan@college.edu', course: 'Civil',            year: '3rd', password: 'student123' },
];

// Today's quiz
const TODAY_QUIZ = {
  date: (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })(),
  questions: [
    {
      question: 'Which data structure uses LIFO (Last In First Out) principle?',
      options: ['Queue', 'Stack', 'Tree', 'Graph'],
      correctAnswer: 1,
    },
    {
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)'],
      correctAnswer: 2,
    },
    {
      question: 'Which HTTP method is used to update a resource in REST APIs?',
      options: ['GET', 'POST', 'DELETE', 'PUT'],
      correctAnswer: 3,
    },
    {
      question: 'In React, which hook is used to manage component state?',
      options: ['useEffect', 'useContext', 'useState', 'useRef'],
      correctAnswer: 2,
    },
    {
      question: 'What does SQL stand for?',
      options: [
        'Structured Query Language',
        'Simple Query Logic',
        'System Query Layer',
        'Structured Question List',
      ],
      correctAnswer: 0,
    },
  ],
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Student.deleteMany({});
    await Quiz.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create students (passwords hashed via pre-save hook)
    const created = await Student.create(STUDENTS);
    console.log(`👥 Created ${created.length} users`);
    created.forEach((s) => console.log(`   • ${s.name} (${s.role}) — ${s.email}`));

    // Create today's quiz
    await Quiz.create(TODAY_QUIZ);
    console.log('📝 Created today\'s quiz with 5 questions');

    console.log('\n🎉 Seed complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin login:   admin@edutrack.com / admin123');
    console.log('Student login: alice@college.edu / student123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
