const express = require('express');
const crypto = require('crypto');
const Group = require('../models/Group');
const GroupAttempt = require('../models/GroupAttempt');
const Lesson = require('../models/Lesson');
const auth = require('../middleware/auth');

const router = express.Router();

const generateGroupCode = () => crypto.randomBytes(3).toString('hex').toUpperCase();

// Create a new group (owner is the authenticated student)
router.post('/', auth, async (req, res) => {
  const { name, grade, unitNumber } = req.body;
  if (!grade || !unitNumber) {
    return res.status(400).json({ error: 'grade and unitNumber are required' });
  }

  const code = generateGroupCode();
  const group = await Group.create({
    code,
    name: name || `Group ${code}`,
    owner: req.student._id,
    members: [req.student._id],
    grade,
    unitNumber,
  });

  return res.status(201).json({ group });
});

// Join an existing group by code
router.post('/join', auth, async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Group code is required' });
  }

  const group = await Group.findOne({ code: code.toUpperCase() });
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  if (!group.members.includes(req.student._id)) {
    group.members.push(req.student._id);
    await group.save();
  }

  return res.json({ group });
});

// Get group detail (with members and recent attempts)
router.get('/:code', auth, async (req, res) => {
  const group = await Group.findOne({ code: req.params.code.toUpperCase() }).populate('members', 'username fullName grade avatar');
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  const attempts = await GroupAttempt.find({ group: group._id }).sort({ createdAt: -1 }).limit(30);

  return res.json({ group, recentAttempts: attempts });
});

// Submit a group attempt (for a specific student in the group)
router.post('/:code/attempt', auth, async (req, res) => {
  const { lessonId, score, pronunciationScore, fluencyScore, feedback } = req.body;
  const group = await Group.findOne({ code: req.params.code.toUpperCase() });
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  const attempt = await GroupAttempt.create({
    group: group._id,
    lesson: lesson._id,
    student: req.student._id,
    score: score || 0,
    pronunciationScore: pronunciationScore || 0,
    fluencyScore: fluencyScore || 0,
    feedback: feedback || '',
  });

  return res.status(201).json({ attempt });
});

module.exports = router;
