import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import PageLayout from '../components/PageLayout';

export default function PracticeNextPage() {
  const { grade, unitNumber } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    const fetchNext = async () => {
      try {
        const response = await api.get('/api/practice/next', {
          params: { grade, unitNumber },
        });

        if (response.data.done) {
          setMessage('Great job! You have completed all lessons in this unit.');
          return;
        }

        const { lesson } = response.data;
        navigate(`/practice/${lesson.id}/${grade}/${unitNumber}`, { replace: true });
      } catch (err) {
        setMessage('Unable to fetch the next exercise.');
      } finally {
        setLoading(false);
      }
    };

    fetchNext();
  }, [grade, unitNumber, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <PageLayout
      title="Next practice"
      subtitle="Your journey picks up where you left off."
      showBack
      onBack={() => navigate(-1)}
    >
      <div className="rounded-2xl border border-brand-100 bg-white/80 p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-brand-800">{message}</h2>
        <p className="text-sm text-brand-600 mt-4">Return to the unit to choose a lesson.</p>
      </div>
    </PageLayout>
  );
}
