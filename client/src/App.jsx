import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/layout/Layout.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import VerifyEmail from './pages/auth/VerifyEmail.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import Profile from './pages/dashboard/Profile.jsx';
import UserManagement from './pages/dashboard/UserManagement.jsx';
import LoadingScreen from './components/common/LoadingScreen.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => (
  <Routes>
    <Route
      path="/"
      element={(
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      )}
    />
    <Route
      path="/login"
      element={(
        <AuthRoute>
          <Login />
        </AuthRoute>
      )}
    />
    <Route
      path="/register"
      element={(
        <AuthRoute>
          <Register />
        </AuthRoute>
      )}
    />
    <Route path="/verify-email" element={<VerifyEmail />} />
    <Route
      path="/profile"
      element={(
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      )}
    />
    <Route
      path="/users"
      element={(
        <AdminRoute>
          <Layout>
            <UserManagement />
          </Layout>
        </AdminRoute>
      )}
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
