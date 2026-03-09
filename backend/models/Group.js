const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  grade: { type: Number, enum: [4, 5, 6], required: true },
  unitNumber: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Group', GroupSchema);
