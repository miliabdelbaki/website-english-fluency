const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, default: '' },
  grade: { type: Number, enum: [4, 5, 6], required: true },
  role: { type: String, enum: ['student', 'teacher'], default: 'student' },
  avatar: { type: String, default: '' },
  points: { type: Number, default: 0 },
  badges: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

module.exports = mongoose.model('Student', StudentSchema);
