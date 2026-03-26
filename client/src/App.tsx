import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { Chat } from './components/Chat';
import { LoginForm } from './components/LoginForm';

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Chat /> : <LoginForm />;
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;