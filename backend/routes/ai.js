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

    const prompt = `Tu es un professeur d'anglais. Un élève a prononcé la phrase suivante (transcription) : "${transcript}". La phrase attendue est : "${expected}".

Donne une évaluation simple sur 100 de la prononciation. Donne aussi un commentaire clair en français et une suggestion de phrase à répéter (en anglais). Réponds uniquement en JSON avec les champs : score (nombre 0-100), feedback (texte), suggestion (phrase).`;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Tu es un assistant pédagogique pour corriger la prononciation.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 250,
      temperature: 0.5,
    });

    const text = response.data.choices?.[0]?.message?.content || '';

    // Tenter de parser le JSON renvoyé par l'IA. Si échec, renvoyer le texte brut.
    try {
      const parsed = JSON.parse(text);
      return res.json({ ...parsed });
    } catch (err) {
      return res.json({ score: null, feedback: text.trim(), suggestion: null });
    }
  } catch (err) {
    console.error('OpenAI error', err?.response?.data || err.message || err);
    return res.status(500).json({ error: 'Erreur lors de l’appel OpenAI.' });
  }
});

module.exports = router;
