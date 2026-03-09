const express = require('express');
const Grade = require('../models/Grade');
const Unit = require('../models/Unit');
const Lesson = require('../models/Lesson');
const Exercise = require('../models/Exercise');

const router = express.Router();

const ADMIN_KEY =
  process.env.ADMIN_KEY ||
  process.env.VITE_ADMIN_KEY ||
  process.env.VITE_TEACHER_PASSWORD ||
  'change-me';

// Simple admin middleware - uses a header token so you can call from Postman.
const requireAdminKey = (req, res, next) => {
  const key = req.header('x-admin-key');
  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
};

// Create/update a full unit (unit + lessons + exercises) in one request.
// Body format:
// {
//   grade: 4,
//   unitNumber: 1,
//   title: 'Entertaining Myself',
//   description: '...', (optional)
//   lessons: [
//     {
//       number: 1,
//       title: 'My Favorite Game',
//       exercises: [
//         { type: 'sentence', prompt: '...', expected: '...' },
//         ...
//       ],
//     },
//     ...
//   ],
// }
router.post('/unit', requireAdminKey, async (req, res) => {
  const { grade, unitNumber, title, description = '', lessons } = req.body;

  if (!grade || !unitNumber || !title || !Array.isArray(lessons)) {
    return res.status(400).json({ error: 'grade, unitNumber, title and lessons are required' });
  }

  // Ensure grade exists
  const gradeDoc = await Grade.findOne({ number: grade });
  if (!gradeDoc) {
    return res.status(404).json({ error: `Grade ${grade} not found` });
  }

  // Upsert unit
  const unit = await Unit.findOneAndUpdate(
    { grade, number: unitNumber },
    { title, description, grade, number: unitNumber },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Remove existing lessons/exercises for this unit so the payload is authoritative.
  const existingLessons = await Lesson.find({ grade, unitNumber });
  const existingLessonIds = existingLessons.map((l) => l._id);
  await Exercise.deleteMany({ lesson: { $in: existingLessonIds } });
  await Lesson.deleteMany({ grade, unitNumber });

  // Create lessons + exercises.
  const createdLessons = [];
  for (const lessonPayload of lessons) {
    const { number, title: lessonTitle, exercises: exercisePayloads } = lessonPayload;
    if (!number || !lessonTitle || !Array.isArray(exercisePayloads)) continue;

    const lesson = await Lesson.create({
      grade,
      unitNumber,
      number,
      title: lessonTitle,
    });

    const exercises = await Promise.all(
      exercisePayloads.map(async (ex) => {
        const exercise = await Exercise.create({
          lesson: lesson._id,
          type: ex.type || 'sentence',
          prompt: ex.prompt || '',
          expected: ex.expected || '',
        });
        return exercise._id;
      })
    );

    lesson.exercises = exercises;
    await lesson.save();
    createdLessons.push(lesson);
  }

  return res.status(201).json({
    unit,
    lessons: createdLessons.length,
  });
});

// Get unit details (unit + lessons + exercises)
router.get('/unit', requireAdminKey, async (req, res) => {
  const grade = Number(req.query.grade);
  const unitNumber = Number(req.query.unitNumber);
  if (!grade || !unitNumber) {
    return res.status(400).json({ error: 'grade and unitNumber query params are required' });
  }

  const unit = await Unit.findOne({ grade, number: unitNumber });
  if (!unit) {
    return res.status(404).json({ error: 'Unit not found' });
  }

  const lessons = await Lesson.find({ grade, unitNumber }).sort({ number: 1 }).populate('exercises');
  return res.json({ unit, lessons });
});

// Delete unit (and its lessons + exercises)
router.delete('/unit', requireAdminKey, async (req, res) => {
  const grade = Number(req.query.grade);
  const unitNumber = Number(req.query.unitNumber);
  if (!grade || !unitNumber) {
    return res.status(400).json({ error: 'grade and unitNumber query params are required' });
  }

  const unit = await Unit.findOneAndDelete({ grade, number: unitNumber });
  if (!unit) {
    return res.status(404).json({ error: 'Unit not found' });
  }

  const lessons = await Lesson.find({ grade, unitNumber });
  const lessonIds = lessons.map((l) => l._id);
  await Exercise.deleteMany({ lesson: { $in: lessonIds } });
  await Lesson.deleteMany({ grade, unitNumber });

  return res.json({ deleted: true });
});

module.exports = router;
