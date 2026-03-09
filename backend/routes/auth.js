const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const router = express.Router();

const createToken = (student) => {
  const payload = {
    sub: student._id.toString(),
    username: student.username,
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'change-me', {
    expiresIn: '30d',
  });
};

// Register a new student
router.post('/signup', async (req, res) => {
  const { username, password, fullName, grade, role = 'student' } = req.body;
  if (!username || !password || !grade) {
    return res.status(400).json({ error: 'username, password and grade are required' });
  }

  const existing = await Student.findOne({ username });
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const student = await Student.create({ username, passwordHash, fullName, grade, role });

  const token = createToken(student);
  return res.status(201).json({
    token,
    student: {
      id: student._id,
      username: student.username,
      grade: student.grade,
      fullName: student.fullName,
      points: student.points,
      role: student.role,
    },
  });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const student = await Student.findOne({ username });
  if (!student) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, student.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = createToken(student);
  return res.json({
    token,
    student: {
      id: student._id,
      username: student.username,
      grade: student.grade,
      fullName: student.fullName,
      points: student.points,
      role: student.role,
    },
  });
});

// Get current student profile
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization headers' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'change-me');
    const student = await Student.findById(payload.sub).select('-passwordHash');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    return res.json({ student });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
