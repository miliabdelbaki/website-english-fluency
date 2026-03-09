const express = require('express');
const Grade = require('../models/Grade');

const router = express.Router();

// Get all grades (static for 4,5,6)
router.get('/', async (req, res) => {
  const grades = await Grade.find().sort({ number: 1 });
  return res.json({ grades });
});

module.exports = router;
