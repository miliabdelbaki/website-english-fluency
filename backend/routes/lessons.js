const express = require('express');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

const router = express.Router();

// Get lessons for a given grade and unit.
router.get('/:grade/:unitNumber', auth, async (req, res) => {
  const grade = Number(req.params.grade);
  const unitNumber = Number(req.params.unitNumber);

  const lessons = await Lesson.find({ grade, unitNumber }).sort({ number: 1 }).populate('exercises');
  const progress = await Progress.find({
    student: req.student._id,
    grade,
    unitNumber,
  });

  const progressMap = new Map(progress.map((p) => [`lesson_${p.lessonNumber}`, p]));

  const lessonsWithStatus = lessons.map((lesson) => {
    const status = progressMap.get(`lesson_${lesson.number}`);
    return {
      ...lesson.toObject(),
      progress: status || { status: 'locked', pointsEarned: 0 },
    };
  });

  return res.json({ lessons: lessonsWithStatus });
});

module.exports = router;
