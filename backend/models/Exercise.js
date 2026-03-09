const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  type: { type: String, enum: ['word', 'sentence'], default: 'word' },
  prompt: { type: String, required: true },
  expected: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Exercise', ExerciseSchema);
