// React import not needed with jsx: react-jsx and strict TS settings
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WalletProvider } from './contexts/WalletContext';
import { RewardsProvider } from './contexts/RewardsContext';
import Navbar from './components/Navbar';
import { ErrorBoundary } from './components/ErrorBoundary';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Games from './pages/Games';
import Referrals from './pages/Referrals';
import Wallet from './pages/Wallet';
import GamePlay from './pages/GamePlay';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function RootRoute() {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/dashboard" replace /> : <Home />;
}

function App() {
  return (
  <ErrorBoundary>
    <Router>
      <AuthProvider>
        <WalletProvider>
          <RewardsProvider>
            <div className="App min-h-screen bg-crypto-dark overflow-x-hidden">
              <Navbar />
              <main className="pt-20">
                <Routes>
                  <Route path="/" element={<RootRoute />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/games" 
                    element={
                      <ProtectedRoute>
                        <Games />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/gameplay" 
                    element={
                      <ProtectedRoute>
                        <GamePlay />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/referrals" 
                    element={
                      <ProtectedRoute>
                        <Referrals />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/wallet" 
                    element={
                      <ProtectedRoute>
                        <Wallet />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </main>
            </div>
          </RewardsProvider>
        </WalletProvider>
      </AuthProvider>
    </Router>
  </ErrorBoundary>
  );
}

export default App;
