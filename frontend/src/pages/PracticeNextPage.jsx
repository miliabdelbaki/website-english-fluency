import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import PageLayout from '../components/PageLayout';

export default function PracticeNextPage() {
  const { grade, unitNumber } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Chargement...');

  useEffect(() => {
    const fetchNext = async () => {
      try {
        const response = await api.get('/api/practice/next', {
          params: { grade, unitNumber },
        });

        if (response.data.done) {
          setMessage('Bravo ! Tu as terminé toutes les leçons de cette unité.');
          return;
        }

        const { lesson } = response.data;
        navigate(`/practice/${lesson.id}/${grade}/${unitNumber}`, { replace: true });
      } catch (err) {
        setMessage('Impossible de récupérer l’exercice suivant.');
      } finally {
        setLoading(false);
      }
    };

    fetchNext();
  }, [grade, unitNumber, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <PageLayout
      title="Pratique suivante"
      subtitle="Ton parcours reprend là où tu t’es arrêté."
      showBack
      onBack={() => navigate(-1)}
    >
      <div className="rounded-2xl border border-brand-100 bg-white/80 p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-brand-800">{message}</h2>
        <p className="text-sm text-brand-600 mt-4">Retourne à l’unité pour choisir une leçon.</p>
      </div>
    </PageLayout>
  );
}
