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
    setMessage('Creating group...');
    try {
      const response = await api.post('/api/groups', {
        name: `Group ${user?.username || ''}`,
        grade: user?.grade,
        unitNumber: 5,
      });
      setGroup(response.data.group);
      setMessage('Group created! Share the code with your friends.');
    } catch (err) {
      setMessage('Unable to create the group.');
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async () => {
    setLoading(true);
    setMessage('Joining group...');
    try {
      const response = await api.post('/api/groups/join', { code: joinCode });
      setGroup(response.data.group);
      setMessage('You have joined the group!');
    } catch (err) {
      setMessage('Unable to join the group. Check the code.');
    } finally {
      setLoading(false);
    }
  };

  const loadGroup = async (code) => {
    setLoading(true);
    setMessage('Loading group...');
    try {
      const response = await api.get(`/api/groups/${code}`);
      setGroup(response.data.group);
      setMessage('Group loaded.');
    } catch (err) {
      setMessage('Unable to load the group.');
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
      title="Group practice"
      subtitle="Create or join a group to practice with classmates."
      actions={
        <button
          type="button"
          className="button-secondary"
          onClick={() => {
            signOut();
            navigate('/');
          }}
        >
          Log out
        </button>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-brand-700">Create a group</h2>
          <p className="text-sm text-brand-600 mt-2">
            Create a group and share the code with your friends.
          </p>
          <button
            type="button"
            className="button-primary mt-4 w-full"
            onClick={createGroup}
            disabled={loading}
          >
            Create group
          </button>

          {group?.code && (
            <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 p-4">
            <div className="text-sm font-semibold text-brand-700">Group code</div>
            <div className="mt-2 text-lg font-bold">{group.code}</div>
            <div className="mt-2 text-sm text-brand-600">Share this code so your friends can join.</div>
            </div>
          )}
        </div>

        <div className="card p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-brand-700">Join a group</h2>
          <p className="text-sm text-brand-600 mt-2">Enter the group code to join.</p>
          <input
            className="mt-4 w-full rounded-xl border px-3 py-2"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Group code"
          />
          <button
            type="button"
            className="button-primary mt-4 w-full"
            onClick={joinGroup}
            disabled={loading}
          >
            Join
          </button>
        </div>
      </div>

      {group && (
        <div className="mt-6 rounded-2xl border border-brand-100 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-700">Group members</h2>
          <div className="mt-3 grid gap-2">
            {members.map((member) => (
              <div key={member._id} className="flex items-center justify-between rounded-xl border border-brand-100 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-brand-800">{member.fullName || member.username}</div>
                  <div className="text-xs text-brand-600">Grade {member.grade}</div>
                </div>
                <div className="text-xs text-brand-500">{member.role === 'teacher' ? 'Teacher' : 'Student'}</div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-sm text-brand-600">Once the group is formed, each student can submit their attempts via the practice menu.</p>
            <button
              type="button"
              className="button-secondary mt-4"
              onClick={() => navigate('/grades')}
            >
              Back to solo practice
            </button>
          </div>
        </div>
      )}

      {message && <p className="mt-4 text-sm text-brand-700">{message}</p>}
    </PageLayout>
  );
}
