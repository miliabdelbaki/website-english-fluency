const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  grade: { type: Number, required: true, enum: [4, 5, 6] },
  unitNumber: { type: Number, required: true },
  lessonNumber: { type: Number, required: true },
  status: {
    type: String,
    enum: ['locked', 'in_progress', 'completed'],
    default: 'locked',
  },
  pointsEarned: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

ProgressSchema.index({ student: 1, grade: 1, unitNumber: 1, lessonNumber: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);
