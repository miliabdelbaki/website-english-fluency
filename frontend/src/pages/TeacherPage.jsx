import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PageLayout from '../components/PageLayout';
import { useAuth } from '../context/AuthContext';

const defaultLesson = () => ({ number: 1, title: '', exercises: [{ type: 'sentence', prompt: '', expected: '' }] });
const defaultUnit = {
  grade: 4,
  unitNumber: 1,
  title: '',
  description: '',
  lessons: [defaultLesson()],
};

export default function TeacherPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [adminKey, setAdminKey] = useState('change-me');
  const [unit, setUnit] = useState(defaultUnit);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState('');

  useEffect(() => {
    setMessage('');
  }, [unit.grade, unit.unitNumber]);

  // Allow either the Vite env var (frontend) or a Vite version of the backend key.
  // This makes it easier to keep backend (ADMIN_KEY) and frontend passwords in sync.
  const teacherPassword =
    import.meta.env.VITE_TEACHER_PASSWORD || import.meta.env.VITE_ADMIN_KEY || 'change-me';

  const unlock = () => {
    if (adminKey === teacherPassword) {
      setIsUnlocked(true);
      setUnlockError('');
    } else {
      setUnlockError('Mot de passe incorrect.');
    }
  };

  if (!isUnlocked) {
    return (
      <PageLayout
        title="Espace enseignant"
        subtitle="Saisis ton mot de passe enseignant pour accéder aux outils."
        actions={
          <button type="button" className="button-secondary" onClick={() => navigate('/practice-mode')}>
            Retour
          </button>
        }
      >
        <div className="mx-auto w-full max-w-md">
          <div className="card p-8 shadow-xl">
            <h2 className="text-xl font-semibold text-brand-800">Accès enseignant</h2>
            <p className="text-sm text-brand-600 mt-2">Entre le mot de passe enseignant pour continuer.</p>

            <label className="block mt-6">
              <span className="text-sm font-semibold text-brand-700">Mot de passe</span>
              <input
                type="password"
                className="mt-1 w-full rounded-xl border px-4 py-2"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
              />
            </label>

            {unlockError && <div className="mt-4 text-sm text-red-600">{unlockError}</div>}

            <button
              type="button"
              className="button-primary mt-6 w-full"
              onClick={unlock}
            >
              Accéder
            </button>

            <div className="mt-4 text-xs text-brand-600">
              Le mot de passe enseignant peut être défini dans <code>.env</code> via{' '}
              <code>VITE_TEACHER_PASSWORD</code> (ou <code>VITE_ADMIN_KEY</code> pour
              correspondre à la clé backend).
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  const setField = (field, value) => setUnit((prev) => ({ ...prev, [field]: value }));

  const setLessonField = (index, field, value) => {
    setUnit((prev) => {
      const lessons = [...prev.lessons];
      lessons[index] = { ...lessons[index], [field]: value };
      return { ...prev, lessons };
    });
  };

  const setExerciseField = (lessonIndex, exerciseIndex, field, value) => {
    setUnit((prev) => {
      const lessons = [...prev.lessons];
      const lesson = { ...lessons[lessonIndex] };
      const exercises = [...lesson.exercises];
      exercises[exerciseIndex] = { ...exercises[exerciseIndex], [field]: value };
      lesson.exercises = exercises;
      lessons[lessonIndex] = lesson;
      return { ...prev, lessons };
    });
  };

  const addLesson = () => {
    setUnit((prev) => ({
      ...prev,
      lessons: [...prev.lessons, defaultLesson()],
    }));
  };

  const removeLesson = (index) => {
    setUnit((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index),
    }));
  };

  const addExercise = (lessonIndex) => {
    setUnit((prev) => {
      const lessons = [...prev.lessons];
      const lesson = { ...lessons[lessonIndex] };
      lesson.exercises = [...lesson.exercises, { type: 'sentence', prompt: '', expected: '' }];
      lessons[lessonIndex] = lesson;
      return { ...prev, lessons };
    });
  };

  const removeExercise = (lessonIndex, exerciseIndex) => {
    setUnit((prev) => {
      const lessons = [...prev.lessons];
      const lesson = { ...lessons[lessonIndex] };
      lesson.exercises = lesson.exercises.filter((_, i) => i !== exerciseIndex);
      lessons[lessonIndex] = lesson;
      return { ...prev, lessons };
    });
  };

  const loadUnit = async () => {
    setLoading(true);
    setMessage('Chargement...');
    try {
      const response = await api.get('/api/admin/unit', {
        params: { grade: unit.grade, unitNumber: unit.unitNumber },
        headers: { 'x-admin-key': adminKey },
      });
      setUnit((prev) => ({
        ...prev,
        title: response.data.unit.title,
        description: response.data.unit.description || '',
        lessons: response.data.lessons.map((lesson) => ({
          number: lesson.number,
          title: lesson.title,
          exercises: (lesson.exercises || []).map((ex) => ({
            type: ex.type,
            prompt: ex.prompt,
            expected: ex.expected,
          })),
        })),
      }));
      setMessage('Unité chargée.');
    } catch (err) {
      setMessage('Impossible de charger l’unité. Vérifie les paramètres ou la clé admin.');
    } finally {
      setLoading(false);
    }
  };

  const saveUnit = async () => {
    setLoading(true);
    setMessage('Enregistrement...');
    try {
      await api.post(
        '/api/admin/unit',
        {
          grade: unit.grade,
          unitNumber: unit.unitNumber,
          title: unit.title,
          description: unit.description,
          lessons: unit.lessons,
        },
        {
          headers: { 'x-admin-key': adminKey },
        },
      );
      setMessage('Unité enregistrée avec succès.');
    } catch (err) {
      setMessage('Erreur lors de l’enregistrement. Vérifie les données et la clé admin.');
    } finally {
      setLoading(false);
    }
  };

  const deleteUnit = async () => {
    if (!window.confirm('Supprimer cette unité et toutes ses leçons ?')) return;
    setLoading(true);
    setMessage('Suppression...');
    try {
      await api.delete('/api/admin/unit', {
        params: { grade: unit.grade, unitNumber: unit.unitNumber },
        headers: { 'x-admin-key': adminKey },
      });
      setUnit(defaultUnit);
      setMessage('Unité supprimée.');
    } catch (err) {
      setMessage('Impossible de supprimer l’unité.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title="Teacher Console"
      subtitle="Gère les unités, les leçons et les exercices (CRUD)."
      actions={
        <button type="button" className="button-secondary" onClick={() => navigate('/practice-mode')}>
          Retour
        </button>
      }
    >
      <div className="grid gap-6">
        <div className="card p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-brand-800">Clé admin</h2>
          <p className="text-sm text-brand-600 mt-1">Utilise la clé ci-dessous pour appeler l’API admin.</p>
          <input
            className="mt-4 w-full rounded-xl border px-4 py-2"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />
        </div>

        <div className="card p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-brand-800">Unité</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-brand-700">Grade</span>
              <select
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={unit.grade}
                onChange={(e) => setField('grade', Number(e.target.value))}
              >
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-brand-700">Unité</span>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={unit.unitNumber}
                onChange={(e) => setField('unitNumber', Number(e.target.value))}
              />
            </label>
          </div>

          <label className="block mt-4">
            <span className="text-sm font-semibold text-brand-700">Titre</span>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={unit.title}
              onChange={(e) => setField('title', e.target.value)}
            />
          </label>
          <label className="block mt-4">
            <span className="text-sm font-semibold text-brand-700">Description</span>
            <textarea
              className="mt-1 w-full rounded-xl border px-3 py-2"
              rows={3}
              value={unit.description}
              onChange={(e) => setField('description', e.target.value)}
            />
          </label>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={loadUnit} type="button" className="button-secondary" disabled={loading}>
              Charger
            </button>
            <button onClick={saveUnit} type="button" className="button-primary" disabled={loading}>
              Enregistrer
            </button>
            <button onClick={deleteUnit} type="button" className="button-danger" disabled={loading}>
              Supprimer
            </button>
          </div>

          {message && <p className="mt-4 text-sm text-brand-700">{message}</p>}
        </div>

        <div className="card p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-brand-800">Leçons</h2>
          <p className="text-sm text-brand-600 mt-1">Ajoute ou modifie les leçons et leurs exercices.</p>

          {unit.lessons.map((lesson, li) => (
            <div key={li} className="mt-6 rounded-2xl border border-brand-100 bg-white/70 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-brand-700">Leçon {li + 1}</span>
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => removeLesson(li)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <label className="block">
                  <span className="text-xs font-semibold text-brand-700">N°</span>
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    value={lesson.number}
                    onChange={(e) => setLessonField(li, 'number', Number(e.target.value))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-brand-700">Titre</span>
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    value={lesson.title}
                    onChange={(e) => setLessonField(li, 'title', e.target.value)}
                  />
                </label>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-brand-700">Exercices</span>
                  <button
                    type="button"
                    className="button-secondary text-xs"
                    onClick={() => addExercise(li)}
                  >
                    Ajouter un exercice
                  </button>
                </div>

                {lesson.exercises.map((exercise, ei) => (
                  <div key={ei} className="mt-3 rounded-xl border border-brand-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-brand-700">Exercice {ei + 1}</span>
                      <button
                        type="button"
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => removeExercise(li, ei)}
                      >
                        Supprimer
                      </button>
                    </div>
                    <div className="grid gap-3 mt-3 md:grid-cols-3">
                      <label className="block">
                        <span className="text-xs font-semibold text-brand-700">Type</span>
                        <select
                          className="mt-1 w-full rounded-xl border px-3 py-2"
                          value={exercise.type}
                          onChange={(e) => setExerciseField(li, ei, 'type', e.target.value)}
                        >
                          <option value="sentence">Phrase</option>
                          <option value="word">Mot</option>
                        </select>
                      </label>
                      <label className="block md:col-span-2">
                        <span className="text-xs font-semibold text-brand-700">Prompt</span>
                        <input
                          className="mt-1 w-full rounded-xl border px-3 py-2"
                          value={exercise.prompt}
                          onChange={(e) => setExerciseField(li, ei, 'prompt', e.target.value)}
                        />
                      </label>
                    </div>
                    <label className="block mt-3">
                      <span className="text-xs font-semibold text-brand-700">Réponse attendue</span>
                      <input
                        className="mt-1 w-full rounded-xl border px-3 py-2"
                        value={exercise.expected}
                        onChange={(e) => setExerciseField(li, ei, 'expected', e.target.value)}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button type="button" className="button-secondary mt-6" onClick={addLesson}>
            Ajouter une leçon
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
