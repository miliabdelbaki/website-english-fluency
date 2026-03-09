import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import PracticeModePage from './pages/PracticeModePage';
import GradeSelectionPage from './pages/GradeSelectionPage';
import UnitSelectionPage from './pages/UnitSelectionPage';
import LessonSelectionPage from './pages/LessonSelectionPage';
import PracticePage from './pages/PracticePage';
import PracticeNextPage from './pages/PracticeNextPage';
import GroupPracticePage from './pages/GroupPracticePage';
import TeacherPage from './pages/TeacherPage';
import NotFoundPage from './pages/NotFoundPage';

function ProtectedRoute({ children, requiredRole }) {
  const { token, user, loading } = useAuth();
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // While we're validating the token and fetching user info, avoid redirect loops.
  if (loading && !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-lg font-semibold">Chargement…</div>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-brand-100 bg-white/80 p-8 text-center shadow-sm">
          <div className="text-3xl font-semibold text-brand-800 mb-3">Accès réservé</div>
          <div className="text-sm text-brand-600 mb-6">
            Cette page est réservée aux enseignants. Connecte-toi avec un compte enseignant pour y accéder.
          </div>
          <button
            type="button"
            className="button-primary"
            onClick={() => (window.location.href = '/practice-mode')}
          >
            Retour à la pratique
          </button>
        </div>
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/practice-mode"
          element={
            <ProtectedRoute>
              <PracticeModePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/grades"
          element={
            <ProtectedRoute>
              <GradeSelectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/units/:grade"
          element={
            <ProtectedRoute>
              <UnitSelectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lessons/:grade/:unitNumber"
          element={
            <ProtectedRoute>
              <LessonSelectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/:lessonId/:grade/:unitNumber"
          element={
            <ProtectedRoute>
              <PracticePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/next/:grade/:unitNumber"
          element={
            <ProtectedRoute>
              <PracticeNextPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/group"
          element={
            <ProtectedRoute>
              <GroupPracticePage />
            </ProtectedRoute>
          }
        />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
