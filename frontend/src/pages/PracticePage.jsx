import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageLayout from '../components/PageLayout';

export default function PracticePage() {
  const { lessonId, grade, unitNumber } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [aiFeedback, setAiFeedback] = useState(null);
  const [mediaPermissionError, setMediaPermissionError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const recognizesSpeech = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await api.get(`/api/lessons/${grade}/${unitNumber}`);
        const lessons = response.data.lessons || [];
        const found = lessons.find((l) => l._id === lessonId);
        setLesson(found || null);

        if (found) {
          setExercises(found.exercises || []);
          setSelected(found.exercises?.[0]?._id || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, grade, unitNumber]);

  const currentExercise = useMemo(() => {
    if (!selected) return null;
    const exercise = exercises.find((e) => e._id === selected);
    return exercise || null;
  }, [selected, exercises]);

  const speakPronunciation = () => {
    const phrase = currentExercise?.expected || currentExercise?.prompt || '';
    if (!phrase) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      setMediaPermissionError('Speech synthesis is not available in your browser.');
    }
  };

  const startRecording = async () => {
    setMediaPermissionError(null);
    setTranscript('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMediaPermissionError('Your browser does not support audio recording.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      });

      recorder.addEventListener('stop', () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
      });

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);

      // Speech recognition (transcription) for basic correctness check
      if (recognizesSpeech) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          const transcriptText = event.results[0]?.[0]?.transcript || '';
          setTranscript(transcriptText);
        };

        recognition.onerror = (event) => {
          console.warn('SpeechRecognition error', event.error);
        };

        recognition.onend = () => {
          recognitionRef.current = null;
        };

        recognitionRef.current = recognition;
        recognition.start();
      }
    } catch (err) {
      setMediaPermissionError('Unable to access the microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    setRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
  };

  const handleRecordClick = async () => {
    if (recording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl]);

  const normalizeText = (text) =>
    (text || '')
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:]/g, '')
      .replace(/\s+/g, ' ');

  const computeScoreFromTranscript = (expected, actual) => {
    if (!expected) return { score: 50, good: false };
    const exp = normalizeText(expected);
    const act = normalizeText(actual);
    if (!act) return { score: 40, good: false };

    const exact = exp === act;
    if (exact) return { score: 95, good: true };

    const wordsExp = exp.split(' ');
    const wordsAct = act.split(' ');
    const common = wordsExp.filter((w) => wordsAct.includes(w)).length;
    const ratio = common / Math.max(wordsExp.length, 1);

    const score = Math.min(90, Math.max(20, Math.round(ratio * 100)));
    return { score, good: ratio >= 0.6 };
  };

const computeAiFeedback = (expected, actual) => {
  const exp = normalizeText(expected);
  const act = normalizeText(actual);

  if (!act) {
    return 'It seems like you did not say anything or the audio was not captured. Try speaking louder or more clearly.';
  }

  if (exp === act) {
    return 'Great! Your pronunciation is very close to the expected phrase.';
  }

  const wordsExp = exp.split(' ');
  const wordsAct = act.split(' ');
  const missing = wordsExp.filter((w) => !wordsAct.includes(w));
  const extra = wordsAct.filter((w) => !wordsExp.includes(w));

  const suggestions = [];

  if (missing.length) {
    suggestions.push(`You missed these words: ${missing.join(', ')}.`);
  }

  if (extra.length) {
    suggestions.push(`You added these extra words: ${extra.join(', ')}.`);
  }

  if (!suggestions.length) {
    suggestions.push('The structure is close, but some words differ. Try focusing on the expected phrase.');
  }

  suggestions.push(`Expected phrase: "${expected}"`);
  suggestions.push(`You said: "${actual}"`);

  return suggestions.join(' ');
};

  const onSubmitAttempt = async () => {
    if (!currentExercise || !lesson) return;

    const expected = currentExercise.expected || currentExercise.prompt || '';
    const { score: computedScore, good } = computeScoreFromTranscript(expected, transcript);
    const pronunciationScore = computedScore;
    const fluencyScore = Math.max(0, computedScore - 5);

    try {
      let aiResult;
      try {
        const response = await api.post('/api/ai/pronunciation', { expected, transcript });
        aiResult = response.data;
      } catch (err) {
        const errorMessage = err?.response?.data?.error;
        if (errorMessage) {
          setAiFeedback(`AI non disponible : ${errorMessage}`);
        }
        // If OpenAI endpoint is not configured / fails, fallback to local heuristics.
        aiResult = null;
      }

      const finalScore = aiResult?.score ?? computedScore;
      const finalFeedback = aiResult?.feedback ?? (good ? 'Great! Your pronunciation matches well.' : 'Keep going, it is not quite right yet.');
      const finalSuggestion = aiResult?.suggestion || null;

      await api.post('/api/progress/attempt', {
        lessonId: lesson._id,
        exerciseId: currentExercise._id,
        score: finalScore,
        pronunciationScore: finalScore,
        fluencyScore: Math.max(0, finalScore - 5),
        feedback: finalFeedback,
        audioUrl: recordedUrl || '',
      });

      setScore({ generatedScore: finalScore, pronunciationScore: finalScore, fluencyScore: Math.max(0, finalScore - 5) });
      setAiFeedback(finalSuggestion || aiResult?.feedback || computeAiFeedback(expected, transcript));
      setFeedback(finalFeedback);
    } catch (err) {
        setFeedback('Error sending your recording. Please try again later.');
    }
  };

  // simplified: fallback when no lesson is found
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="card p-8 text-center">
        <div className="text-lg font-semibold text-brand-700">Lesson not found.</div>
          <p className="text-sm text-gray-600 mt-2">Return to lesson selection.</p>
          <button className="button-primary mt-6" type="button" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      title={`Practice: ${lesson.title}`}
      subtitle="Listen, record, and improve your pronunciation."
      showBack
      onBack={() => navigate(-1)}
    >
      <div className="grid gap-6">
        <div className="card p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-brand-800">Exercise</h2>
              <p className="text-sm text-brand-600">Choose what you want to repeat.</p>
            </div>
            <div className="text-4xl">🎧</div>
          </div>
          <div className="grid gap-3">
            {exercises.map((exercise) => (
              <button
                key={exercise._id}
                type="button"
                className={`w-full text-left p-4 rounded-xl border ${
                  selected === exercise._id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'
                } focus:outline-none`}
                onClick={() => setSelected(exercise._id)}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{exercise.type === 'word' ? 'Word' : 'Sentence'}</p>
                  {selected === exercise._id && <span className="text-brand-600">Selected</span>}
                </div>
                <p className="text-sm text-brand-600 mt-2">{exercise.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-3 text-brand-800">Your practice</h2>
          <p className="text-sm text-brand-600 mb-4">
            Press "Record" then submit your result.
          </p>

          <div className="grid gap-3">
            <button type="button" className="button-secondary" onClick={speakPronunciation}>
              Listen to pronunciation
            </button>
            <button
              type="button"
              className={`button-secondary ${recording ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
              onClick={handleRecordClick}
            >
              {recording ? 'Stop recording' : 'Record my voice'}
            </button>
            <button type="button" className="button-primary" onClick={onSubmitAttempt}>
              Submit recording
            </button>
          </div>

          {mediaPermissionError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {mediaPermissionError}
            </div>
          )}

          {transcript && (
            <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 p-4">
              <div className="text-sm font-semibold text-brand-700">Detected transcription</div>
              <div className="mt-1 text-sm text-brand-700">"{transcript}"</div>
            </div>
          )}

          {recordedUrl && (
            <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 p-4">
              <div className="text-sm font-semibold text-brand-700">Play your recording</div>
              <audio className="mt-2 w-full" controls src={recordedUrl} />
            </div>
          )}

          {score && (
            <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50 p-4">
              <div className="text-sm font-semibold text-brand-700">Result</div>
              <div className="mt-2 text-sm text-brand-700">Overall score: {score.generatedScore} / 100</div>
              <div className="text-sm text-brand-700">Pronunciation: {score.pronunciationScore} / 100</div>
              <div className="text-sm text-brand-700">Fluency: {score.fluencyScore} / 100</div>
            </div>
          )}

          {feedback && <p className="mt-4 text-sm text-brand-700">{feedback}</p>}

          {aiFeedback && (
            <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 p-4">
              <div className="text-sm font-semibold text-brand-700">AI feedback</div>
              <div className="mt-2 text-sm text-brand-700">{aiFeedback}</div>
            </div>
          )}

          <div className="mt-6 text-xs text-brand-600">
            Note: This demo uses local assistance (transcription + comparison) to provide feedback on your pronunciation.
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
