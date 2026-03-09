const mongoose = require('mongoose');

const GroupAttemptSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  score: { type: Number, min: 0, max: 100, default: 0 },
  pronunciationScore: { type: Number, min: 0, max: 100, default: 0 },
  fluencyScore: { type: Number, min: 0, max: 100, default: 0 },
  feedback: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('GroupAttempt', GroupAttemptSchema);
