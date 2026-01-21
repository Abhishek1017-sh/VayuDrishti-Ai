import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'admin', 'industry', 'home'

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" /> : 
            <Login onLogin={handleLogin} />
          } 
        />
        
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout userRole={userRole} onLogout={handleLogout}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
