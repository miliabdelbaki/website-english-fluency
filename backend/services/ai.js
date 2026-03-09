// AI scoring stubs (Whisper/OpenAI placeholder)
// In a real implementation, these functions would send audio to a speech-to-text engine
// and compare the transcript to the expected text.

const randomScore = () => Math.min(100, Math.max(0, 70 + Math.floor(Math.random() * 31)));

/**
 * Returns a simulated scoring result for a pronunciation exercise.
 * @param {Object} params
 * @param {string} params.audioUrl - URL to the audio recording (optional)
 * @param {string} params.expectedText - Expected transcription (text)
 */
async function scorePronunciation({ audioUrl, expectedText }) {
  // Placeholder: in production, call Whisper + a scoring model.
  // - Use audioUrl to fetch the audio (or accept bytes in request)
  // - Use expectedText to compare with predicted transcript

  const pronunciationScore = randomScore();
  const fluencyScore = Math.max(0, pronunciationScore - Math.floor(Math.random() * 10));
  const overallScore = Math.round((pronunciationScore + fluencyScore) / 2);

  const hints = [];
  if (pronunciationScore < 70) {
    hints.push('Essaie de parler plus lentement et articule bien chaque mot.');
  }
  if (fluencyScore < 70) {
    hints.push('Essaie de garder un rythme plus régulier.');
  }

  return {
    score: overallScore,
    pronunciationScore,
    fluencyScore,
    feedback: hints.length ? hints.join(' ') : 'Bon travail ! Continue comme ça.',
  };
}

module.exports = {
  scorePronunciation,
};
