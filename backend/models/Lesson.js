const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  grade: { type: Number, required: true, enum: [4, 5, 6] },
  unitNumber: { type: Number, required: true },
  number: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }],
  createdAt: { type: Date, default: Date.now },
});

LessonSchema.index({ grade: 1, unitNumber: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Lesson', LessonSchema);
