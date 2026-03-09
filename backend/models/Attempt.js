const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  score: { type: Number, min: 0, max: 100, default: 0 },
  pronunciationScore: { type: Number, min: 0, max: 100, default: 0 },
  fluencyScore: { type: Number, min: 0, max: 100, default: 0 },
  feedback: { type: String, default: '' },
  audioUrl: { type: String, default: '' },
  completedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Attempt', AttemptSchema);
