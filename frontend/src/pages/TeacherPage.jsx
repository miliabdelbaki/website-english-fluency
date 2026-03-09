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

  // Allow either the Vite env var (frontend) or a Vite version of the backend key.
  // This makes it easier to keep backend (ADMIN_KEY) and frontend passwords in sync.
  const teacherPassword =
    import.meta.env.VITE_TEACHER_PASSWORD || import.meta.env.VITE_ADMIN_KEY || 'change-me';

  const [adminKey, setAdminKey] = useState(() => teacherPassword);
  const [unit, setUnit] = useState(defaultUnit);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState('');

  useEffect(() => {
    setMessage('');
  }, [unit.grade, unit.unitNumber]);

  const unlock = () => {
    if (adminKey === teacherPassword) {
      setIsUnlocked(true);
      setUnlockError('');
    } else {
      setUnlockError('Incorrect password.');
    }
  };

  if (!isUnlocked) {
    return (
      <PageLayout
        title="Teacher console"
        subtitle="Enter your teacher password to access the tools."
        actions={
          <button type="button" className="button-secondary" onClick={() => navigate('/practice-mode')}>
            Back
          </button>
        }
      >
        <div className="mx-auto w-full max-w-md">
          <div className="card p-8 shadow-xl">
            <h2 className="text-xl font-semibold text-brand-800">Teacher access</h2>
            <p className="text-sm text-brand-600 mt-2">Enter the teacher password to continue.</p>

            <label className="block mt-6">
              <span className="text-sm font-semibold text-brand-700">Password</span>
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
              Unlock
            </button>

            <div className="mt-4 text-xs text-brand-600">
              The teacher password can be set in <code>.env</code> via{' '}
              <code>VITE_TEACHER_PASSWORD</code> (or <code>VITE_ADMIN_KEY</code> to match the backend key).
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
    setMessage('Loading...');
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
      setMessage('Unit loaded.');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Unable to load the unit. Check parameters or the admin key.');
    } finally {
      setLoading(false);
    }
  };

  const saveUnit = async () => {
    setLoading(true);
    setMessage('Saving...');
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
      setMessage('Unit saved successfully.');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error saving. Check the data and admin key.');
    } finally {
      setLoading(false);
    }
  };

  const deleteUnit = async () => {
    if (!window.confirm('Delete this unit and all its lessons?')) return;
    setLoading(true);
    setMessage('Suppression...');
    try {
      await api.delete('/api/admin/unit', {
        params: { grade: unit.grade, unitNumber: unit.unitNumber },
        headers: { 'x-admin-key': adminKey },
      });
      setUnit(defaultUnit);
      setMessage('Unit deleted.');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Unable to delete the unit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title="Teacher Console"
      subtitle="Manage units, lessons, and exercises (CRUD)."
      actions={
        <button type="button" className="button-secondary" onClick={() => navigate('/practice-mode')}>
          Back
        </button>
      }
    >
      <div className="grid gap-6">
        <div className="card p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-brand-800">Admin key</h2>
          <p className="text-sm text-brand-600 mt-1">Use the key below to call the admin API.</p>
          <input
            className="mt-4 w-full rounded-xl border px-4 py-2"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />
        </div>

        <div className="card p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-brand-800">Unit</h2>
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
              <span className="text-sm font-semibold text-brand-700">Unit</span>
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
            <span className="text-sm font-semibold text-brand-700">Title</span>
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
              Load
            </button>
            <button onClick={saveUnit} type="button" className="button-primary" disabled={loading}>
              Save
            </button>
            <button onClick={deleteUnit} type="button" className="button-danger" disabled={loading}>
              Delete
            </button>
          </div>

          {message && <p className="mt-4 text-sm text-brand-700">{message}</p>}
        </div>

        <div className="card p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-brand-800">Lessons</h2>
          <p className="text-sm text-brand-600 mt-1">Add or edit lessons and their exercises.</p>

          {unit.lessons.map((lesson, li) => (
            <div key={li} className="mt-6 rounded-2xl border border-brand-100 bg-white/70 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-brand-700">Lesson {li + 1}</span>
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => removeLesson(li)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <label className="block">
                  <span className="text-xs font-semibold text-brand-700">No.</span>
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    value={lesson.number}
                    onChange={(e) => setLessonField(li, 'number', Number(e.target.value))}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-brand-700">Title</span>
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2"
                    value={lesson.title}
                    onChange={(e) => setLessonField(li, 'title', e.target.value)}
                  />
                </label>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-brand-700">Exercises</span>
                  <button
                    type="button"
                    className="button-secondary text-xs"
                    onClick={() => addExercise(li)}
                  >
                    Add exercise
                  </button>
                </div>

                {lesson.exercises.map((exercise, ei) => (
                  <div key={ei} className="mt-3 rounded-xl border border-brand-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-brand-700">Exercise {ei + 1}</span>
                      <button
                        type="button"
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => removeExercise(li, ei)}
                      >
                        Delete
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
                          <option value="sentence">Sentence</option>
                          <option value="word">Word</option>
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
                      <span className="text-xs font-semibold text-brand-700">Expected answer</span>
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
            Add lesson
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
