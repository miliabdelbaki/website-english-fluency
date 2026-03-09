const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
  grade: { type: Number, required: true, enum: [4, 5, 6] },
  number: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

UnitSchema.index({ grade: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Unit', UnitSchema);
