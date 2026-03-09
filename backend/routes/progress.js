const express = require('express');
const Attempt = require('../models/Attempt');
const Exercise = require('../models/Exercise');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const { scorePronunciation } = require('../services/ai');
const auth = require('../middleware/auth');

const router = express.Router();

// Submit an attempt for a given exercise.
router.post('/attempt', auth, async (req, res) => {
  const {
    lessonId,
    exerciseId,
    score = 0,
    pronunciationScore = 0,
    fluencyScore = 0,
    feedback = '',
    audioUrl = '',
  } = req.body;

  if (!lessonId || !exerciseId) {
    return res.status(400).json({ error: 'lessonId and exerciseId are required' });
  }

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  const exercise = await Exercise.findById(exerciseId);
  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found' });
  }

  let computedScore = score;
  let computedPronunciation = pronunciationScore;
  let computedFluency = fluencyScore;
  let computedFeedback = feedback;

  const needsAiScoring = !score && !pronunciationScore && !fluencyScore;
  if (needsAiScoring) {
    const aiResult = await scorePronunciation({
      audioUrl,
      expectedText: exercise.expected || exercise.prompt || '',
    });

    computedScore = aiResult.score;
    computedPronunciation = aiResult.pronunciationScore;
    computedFluency = aiResult.fluencyScore;
    computedFeedback = aiResult.feedback;
  }

  const attempt = await Attempt.create({
    student: req.student._id,
    lesson: lesson._id,
    exercise: exerciseId,
    score: computedScore,
    pronunciationScore: computedPronunciation,
    fluencyScore: computedFluency,
    feedback: computedFeedback,
    audioUrl,
  });

  // Update progress for the lesson
  await Progress.findOneAndUpdate(
    {
      student: req.student._id,
      grade: lesson.grade,
      unitNumber: lesson.unitNumber,
      lessonNumber: lesson.number,
    },
    {
      $set: {
        status: 'completed',
        pointsEarned: score,
        updatedAt: new Date(),
      },
    },
    { upsert: true, new: true },
  );

  return res.status(201).json({ attempt });
});

// Get overall progress for a unit (to support unlocking group practice)
router.get('/unit/:grade/:unitNumber', auth, async (req, res) => {
  const grade = Number(req.params.grade);
  const unitNumber = Number(req.params.unitNumber);

  const totalLessons = await Lesson.countDocuments({ grade, unitNumber });
  const completedCount = await Progress.countDocuments({
    student: req.student._id,
    grade,
    unitNumber,
    status: 'completed',
  });

  // Provide lesson-level status for UI if needed.
  const progresses = await Progress.find({
    student: req.student._id,
    grade,
    unitNumber,
  }).sort({ lessonNumber: 1 });

  const completionRate = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return res.json({
    grade,
    unitNumber,
    totalLessons,
    completedLessons: completedCount,
    completionRate,
    unlockedGroupPractice: totalLessons > 0 && completedCount === totalLessons,
    lessons: progresses,
  });
});

module.exports = router;
