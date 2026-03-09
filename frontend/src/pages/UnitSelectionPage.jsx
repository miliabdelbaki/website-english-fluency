import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/PageLayout';

export default function UnitSelectionPage() {
  const { grade } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await api.get(`/api/units/${grade}`);
        setUnits(response.data.units);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [grade]);

  const unitIcons = ['🎮', '🏋️', '❄️', '❤️', '🎉', '🛒'];

  return (
    <PageLayout
      title="Page 4: Unit Selection"
      subtitle="Choisis une unité pour découvrir les leçons."
      actions={
        <div className="flex items-center gap-2">
          <button className="button-secondary" type="button" onClick={() => navigate('/grades')}>
            Retour
          </button>
          <button
            className="button-secondary"
            type="button"
            onClick={() => {
              signOut();
              navigate('/');
            }}
          >
            Déconnexion
          </button>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4">
        <div className="rounded-3xl bg-white/70 p-6 shadow-[0_15px_40px_-25px_rgba(0,0,0,0.35)] backdrop-blur">
          <h2 className="text-lg font-semibold text-brand-800">Chaque unité contient plusieurs leçons.</h2>
          <p className="text-sm text-brand-600">Termine-les toutes pour débloquer la pratique de groupe.</p>
          <button
            type="button"
            className="button-primary mt-4 w-full md:w-auto"
            onClick={() => navigate(`/practice/next/${grade}/1`)}
          >
            Pratique la prochaine leçon
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {loading && <div className="text-gray-500">Chargement...</div>}
          {units.map((unit) => {
            const completed = unit.progress?.status === 'completed' || false;
            const icon = unitIcons[(unit.number - 1) % unitIcons.length];
            return (
              <Link
                key={unit._id}
                to={`/lessons/${grade}/${unit.number}`}
                className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-white/70 px-6 py-8 text-center shadow-[0_25px_60px_-25px_rgba(0,0,0,0.45)] backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl"
              >
                {completed && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs rounded-full px-3 py-1">
                    ✅ Terminé
                  </div>
                )}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15 text-4xl text-brand-700 shadow-inner">
                  {icon}
                </div>
                <h2 className="text-xl font-semibold text-brand-700">UNIT {unit.number}</h2>
                <p className="text-sm text-brand-600">{unit.title}</p>
                <div className="mt-2 text-xs text-brand-500">Clique pour voir les leçons</div>
              </Link>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
