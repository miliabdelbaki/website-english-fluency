import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PageLayout from '../components/PageLayout';

export default function GroupPracticePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [groupCode, setGroupCode] = useState('');
  const [group, setGroup] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isTeacher = user?.role === 'teacher';

  const createGroup = async () => {
    setLoading(true);
    setMessage('Création du groupe...');
    try {
      const response = await api.post('/api/groups', {
        name: `Group ${user?.username || ''}`,
        grade: user?.grade,
        unitNumber: 5,
      });
      setGroup(response.data.group);
      setMessage('Groupe créé ! Partage le code avec tes amis.');
    } catch (err) {
      setMessage('Impossible de créer le groupe.');
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async () => {
    setLoading(true);
    setMessage('Rejoindre le groupe...');
    try {
      const response = await api.post('/api/groups/join', { code: joinCode });
      setGroup(response.data.group);
      setMessage('Tu as rejoint le groupe !');
    } catch (err) {
      setMessage('Impossible de rejoindre le groupe. Vérifie le code.');
    } finally {
      setLoading(false);
    }
  };

  const loadGroup = async (code) => {
    setLoading(true);
    setMessage('Chargement du groupe...');
    try {
      const response = await api.get(`/api/groups/${code}`);
      setGroup(response.data.group);
      setMessage('Groupe chargé.');
    } catch (err) {
      setMessage('Impossible de charger le groupe.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (group?.code) {
      loadGroup(group.code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const members = useMemo(() => group?.members || [], [group]);

  return (
    <PageLayout
      title="Pratique en groupe"
      subtitle="Crée ou rejoins un groupe pour t’entraîner avec des camarades."
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
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-brand-700">Créer un groupe</h2>
          <p className="text-sm text-brand-600 mt-2">
            Crée un groupe et partage le code avec tes amis.
          </p>
          <button
            type="button"
            className="button-primary mt-4 w-full"
            onClick={createGroup}
            disabled={loading}
          >
            Créer un groupe
          </button>

          {group?.code && (
            <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 p-4">
              <div className="text-sm font-semibold text-brand-700">Code du groupe</div>
              <div className="mt-2 text-lg font-bold">{group.code}</div>
              <div className="mt-2 text-sm text-brand-600">Partage ce code pour que tes amis puissent rejoindre.</div>
            </div>
          )}
        </div>

        <div className="card p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-brand-700">Rejoindre un groupe</h2>
          <p className="text-sm text-brand-600 mt-2">Entre le code du groupe pour le rejoindre.</p>
          <input
            className="mt-4 w-full rounded-xl border px-3 py-2"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Code de groupe"
          />
          <button
            type="button"
            className="button-primary mt-4 w-full"
            onClick={joinGroup}
            disabled={loading}
          >
            Rejoindre
          </button>
        </div>
      </div>

      {group && (
        <div className="mt-6 rounded-2xl border border-brand-100 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-700">Membres du groupe</h2>
          <div className="mt-3 grid gap-2">
            {members.map((member) => (
              <div key={member._id} className="flex items-center justify-between rounded-xl border border-brand-100 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-brand-800">{member.fullName || member.username}</div>
                  <div className="text-xs text-brand-600">Classe {member.grade}</div>
                </div>
                <div className="text-xs text-brand-500">{member.role === 'teacher' ? 'Professeur' : 'Étudiant'}</div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-sm text-brand-600">Une fois le groupe formé, chaque étudiant pourra envoyer ses tentatives via le menu de pratique.</p>
            <button
              type="button"
              className="button-secondary mt-4"
              onClick={() => navigate('/grades')}
            >
              Revenir à la pratique solo
            </button>
          </div>
        </div>
      )}

      {message && <p className="mt-4 text-sm text-brand-700">{message}</p>}
    </PageLayout>
  );
}
