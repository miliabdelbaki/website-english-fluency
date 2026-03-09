import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/PageLayout';

export default function LessonSelectionPage() {
  const { grade, unitNumber } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await api.get(`/api/lessons/${grade}/${unitNumber}`);
        setLessons(response.data.lessons);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [grade, unitNumber]);

  const computeStatus = (lesson) => {
    const status = lesson.progress?.status || 'locked';
    if (status === 'completed') return { label: 'Completed', color: 'bg-green-500', icon: '✅' };
    if (status === 'in_progress') return { label: 'In progress', color: 'bg-yellow-400', icon: '⏳' };
    return { label: 'Locked', color: 'bg-gray-300', icon: '🔒' };
  };

  return (
    <PageLayout
      title={`Lessons - Unit ${unitNumber}`}
      subtitle="Choose a lesson to practice."
      actions={
        <div className="flex items-center gap-2">
          <button className="button-secondary" type="button" onClick={() => navigate(`/units/${grade}`)}>
            Back
          </button>
          <button
            className="button-secondary"
            type="button"
            onClick={() => {
              signOut();
              navigate('/');
            }}
          >
            Log out
          </button>
        </div>
      }
    >
      <div className="mb-6 rounded-2xl border border-brand-100 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-800">Progress</h2>
        <p className="text-sm text-brand-600 mt-2">
          Complete all lessons to unlock "Group practice".
        </p>
      </div>

      {loading && <div className="text-gray-500">Loading...</div>}
      <div className="grid gap-4">
        {lessons.map((lesson) => {
          const status = computeStatus(lesson);
          const disabled = status.label === 'Locked';
          return (
            <Link
              key={lesson._id}
              to={disabled ? '#' : `/practice/${lesson._id}/${grade}/${unitNumber}`}
              className={`card p-5 hover:shadow-xl transition relative ${
                disabled ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              onClick={(e) => {
                if (disabled) {
                  e.preventDefault();
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-bold">Lesson {lesson.number}</div>
                    <div className="text-xs px-2 py-1 rounded-full bg-brand-100 text-brand-800">{lesson.title}</div>
                  </div>
                  <p className="text-sm text-brand-600 mt-2">Click to practice pronunciation.</p>
                </div>
                <div className={`text-sm font-semibold text-white px-3 py-1 rounded-full ${status.color}`}>
                  {status.icon} {status.label}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PageLayout>
  );
}

