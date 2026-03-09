const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Grade', GradeSchema);
