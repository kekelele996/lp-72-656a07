import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import DocumentEditorPage from './pages/DocumentEditorPage';
import SearchResultsPage from './pages/SearchResultsPage';
import TrashPage from './pages/TrashPage';
import TagDocumentsPage from './pages/TagDocumentsPage';
import VersionComparePage from './pages/VersionComparePage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return !token ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  const { checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth().finally(() => setIsChecking(false));
  }, [checkAuth]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="document/:id" element={<DocumentEditorPage />} />
        <Route path="search" element={<SearchResultsPage />} />
        <Route path="trash" element={<TrashPage />} />
        <Route path="tag/:tag" element={<TagDocumentsPage />} />
        <Route
          path="document/:id/compare/:version1/:version2"
          element={<VersionComparePage />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
