import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageLayout from '../components/PageLayout';

export default function PracticeModePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Chargement...');

  useEffect(() => {
    const checkUnlock = async () => {
      try {
        const response = await api.get(`/api/progress/unit/${user.grade}/5`);
        setUnlocked(response.data.unlockedGroupPractice);
        setStatusMessage(
          response.data.unlockedGroupPractice
            ? 'Pratique de groupe disponible 🎉'
            : 'Terminez toutes les leçons de l’unité pour débloquer la pratique de groupe.',
        );
      } catch (err) {
        setStatusMessage('Impossible de vérifier le déblocage.');
      }
    };

    if (user) checkUnlock();
  }, [user]);

  return (
    <PageLayout
      title={`Salut, ${user?.fullName || user?.username} !`}
      subtitle="Choisis ton mode de pratique pour progresser."
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
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-brand-100 bg-white/70 p-4 shadow-sm">
        <div>
          <div className="text-sm text-brand-600">Utilisateur</div>
          <div className="text-lg font-semibold text-brand-800">{user?.fullName || user?.username || '—'}</div>
        </div>
        <div className="text-sm text-brand-600">Grade : {user?.grade}</div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-3 text-brand-700">Pratique en solo</h2>
          <p className="text-sm text-brand-600 mb-6">
            Entraîne-toi à ton rythme, répète les mots et améliore ta confiance.
          </p>
          <button className="button-primary w-full" type="button" onClick={() => navigate('/grades')}>
            Commencer
          </button>
        </div>

        <div className="card p-6 shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-brand-700">Pratique en groupe</h2>
              <p className="text-sm text-brand-600 mt-1">Travaille avec des amis une fois que ton unité est terminée.</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>

          <button
            type="button"
            className={unlocked ? 'button-primary w-full' : 'button-disabled w-full'}
            disabled={!unlocked}
            onClick={() => navigate('/group')}
          >
            {unlocked ? 'Lancer une session' : 'Bloqué (complète ton unité)'}
          </button>

          <p className="mt-4 text-sm text-brand-600">{statusMessage}</p>
        </div>
      </div>

      <div className="mt-10 text-xs text-brand-600">
        <p>Astuce: commence par l’unité 5 pour le démonstrateur (Celebrations).</p>
      </div>

      <div className="mt-8">
        <button
          type="button"
          className="button-secondary"
          onClick={() => navigate('/teacher')}
        >
          Ouvrir l'espace enseignant
        </button>
      </div>
    </PageLayout>
  );
}
