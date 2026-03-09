const express = require('express');
const Unit = require('../models/Unit');
const Progress = require('../models/Progress');
const auth = require('../middleware/auth');

const router = express.Router();

// Get units for a specific grade, optionally include student progress
router.get('/:grade', auth, async (req, res) => {
  const grade = Number(req.params.grade);
  const units = await Unit.find({ grade }).sort({ number: 1 });

  const progress = await Progress.find({ student: req.student._id, grade });
  const progressMap = new Map(progress.map((p) => [`unit_${p.unitNumber}`, p]));

  const unitsWithProgress = units.map((unit) => ({
    ...unit.toObject(),
    progress: progressMap.get(`unit_${unit.number}`) || null,
  }));

  return res.json({ units: unitsWithProgress });
});

module.exports = router;
