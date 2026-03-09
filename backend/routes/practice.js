const express = require('express');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

const router = express.Router();

// Returns the next exercise for a student to practice in a given grade/unit.
router.get('/next', auth, async (req, res) => {
  const grade = Number(req.query.grade);
  const unitNumber = Number(req.query.unitNumber);

  if (!grade || !unitNumber) {
    return res.status(400).json({ error: 'grade and unitNumber query params are required' });
  }

  const lessons = await Lesson.find({ grade, unitNumber }).sort({ number: 1 });
  if (lessons.length === 0) {
    return res.status(404).json({ error: 'No lessons found for this unit' });
  }

  const completed = await Progress.find({
    student: req.student._id,
    grade,
    unitNumber,
    status: 'completed',
  }).select('lessonNumber');

  const completedLessonNumbers = new Set(completed.map((p) => p.lessonNumber));

  const nextLesson = lessons.find((lesson) => !completedLessonNumbers.has(lesson.number));
  if (!nextLesson) {
    return res.json({ done: true, message: 'All lessons in this unit are completed.' });
  }

  const nextExerciseId = nextLesson.exercises?.[0];
  return res.json({
    done: false,
    lesson: {
      id: nextLesson._id,
      number: nextLesson.number,
      title: nextLesson.title,
    },
    exerciseId: nextExerciseId,
    // placeholder audio for UI demo
    audioPlaceholder: 'https://www.myinstants.com/media/sounds/correct.swf.mp3',
  });
});

module.exports = router;
