const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization headers' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'change-me');
    const student = await Student.findById(payload.sub).select('-passwordHash');
    if (!student) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.student = student;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = auth;
