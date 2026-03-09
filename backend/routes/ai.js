const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const auth = require('../middleware/auth');

const router = express.Router();

// Student pronunciation correction via OpenAI.
// Body: { expected: string, transcript: string }

router.post('/pronunciation', auth, async (req, res) => {
  const { expected, transcript } = req.body;
  if (!expected) return res.status(400).json({ error: 'expected is required' });
  if (!transcript) return res.status(400).json({ error: 'transcript is required' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key is not configured (OPENAI_API_KEY)' });
  }

  try {
    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    const prompt = `You are an English teacher. A student said the following (transcript): "${transcript}". The expected phrase is: "${expected}".

Provide a simple pronunciation score out of 100. Give a clear feedback comment in English and a suggestion phrase to repeat (also in English). Reply only in JSON with fields: score (number 0-100), feedback (text), suggestion (phrase).`;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an educational assistant for correcting pronunciation.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 250,
      temperature: 0.5,
    });

    const text = response.data.choices?.[0]?.message?.content || '';

    // Try to parse the JSON returned by the AI. If it fails, return the raw text.
    try {
      const parsed = JSON.parse(text);
      return res.json({ ...parsed });
    } catch (err) {
      return res.json({ score: null, feedback: text.trim(), suggestion: null });
    }
  } catch (err) {
    console.error('OpenAI error', err?.response?.data || err.message || err);
    return res.status(500).json({ error: 'Error calling OpenAI.' });
  }
});

module.exports = router;
