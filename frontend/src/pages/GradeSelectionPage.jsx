import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/PageLayout';

export default function GradeSelectionPage() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await api.get('/api/grades');
        setGrades(response.data.grades);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  return (
    <PageLayout
      title="Grade Selection (Alone Mode)"
      subtitle="Choisis ta classe pour débuter ton aventure."
      actions={
        <button
          type="button"
          className="button-secondary"
          onClick={() => {
            signOut();
            navigate('/');
          }}
        >
          Se déconnecter
        </button>
      }
    >
      <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 md:grid-cols-3">
        {loading && <div className="text-gray-500">Chargement...</div>}
        {grades.map((grade) => {
          const icon = grade.number === 4 ? '📘' : grade.number === 5 ? '✏️' : '🌍';
          return (
            <Link
              key={grade._id}
              to={`/units/${grade.number}`}
              className="group relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl bg-white/70 px-8 py-10 text-center shadow-[0_25px_60px_-25px_rgba(0,0,0,0.45)] backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-500/15 text-5xl text-brand-700 shadow-inner">
                {icon}
              </div>
              <div className="text-xl font-bold text-brand-800">{grade.name}</div>
              <div className="text-sm text-brand-600">Continue ton parcours de lecture et de parole.</div>
            </Link>
          );
        })}
      </div>
    </PageLayout>
  );
}

