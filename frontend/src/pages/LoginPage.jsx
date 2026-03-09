import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/PageLayout';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    grade: 5,
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setError('');
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const payload = {
        username: form.username,
        password: form.password,
      };

      if (mode === 'signup') {
        payload.fullName = form.fullName;
        payload.grade = Number(form.grade);
        payload.role = form.role || 'student';
      }

      const response = await api.post(url, payload);
      const token = response.data.token;
      const student = response.data.student;
      signIn(token, student);
      // Teachers should land in the teacher console directly.
      navigate(student.role === 'teacher' ? '/teacher' : '/practice-mode');
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title={mode === 'login' ? 'Bienvenue !' : 'Créer un compte'}
      subtitle={
        mode === 'login'
          ? "Connecte-toi pour commencer ta pratique d'anglais."
          : 'Inscris-toi pour débloquer toutes les activités.'
      }
    >
      <div className="mx-auto w-full max-w-md">
        <div className="card p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                {mode === 'login' ? 'Connexion' : 'Inscription'}
              </div>
              <p className="mt-1 text-sm text-brand-700">Choisis un mode pour commencer.</p>
            </div>
            <div className="text-5xl">🧠</div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              className={`flex-1 py-2 rounded-xl font-semibold ${
                mode === 'login' ? 'bg-brand-500 text-white' : 'bg-white text-brand-700'
              }`}
              type="button"
              onClick={() => setMode('login')}
            >
              Se connecter
            </button>
            <button
              className={`flex-1 py-2 rounded-xl font-semibold ${
                mode === 'signup' ? 'bg-brand-500 text-white' : 'bg-white text-brand-700'
              }`}
              type="button"
              onClick={() => setMode('signup')}
            >
              S'inscrire
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-brand-700">Nom complet</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
                  value={form.fullName}
                  onChange={onChange('fullName')}
                  placeholder="Ex : Youssef"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-brand-700">Identifiant</label>
              <input
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
                value={form.username}
                onChange={onChange('username')}
                placeholder="Ex : sami123"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-700">Mot de passe</label>
              <input
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
                type="password"
                value={form.password}
                onChange={onChange('password')}
                placeholder="••••••••"
                required
              />
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-brand-700">Classe</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
                    value={form.grade}
                    onChange={onChange('grade')}
                  >
                    <option value={4}>4ème</option>
                    <option value={5}>5ème</option>
                    <option value={6}>6ème</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-700">Je suis</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
                    value={form.role || 'student'}
                    onChange={onChange('role')}
                  >
                    <option value="student">Étudiant</option>
                    <option value="teacher">Enseignant</option>
                  </select>
                </div>
              </>
            )}

            {error && <div className="text-sm text-red-600">{error}</div>}

            <button disabled={loading} className="button-primary w-full">
              {loading ? 'Patiente...' : mode === 'login' ? 'Se connecter' : 'Créer un compte'}
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
