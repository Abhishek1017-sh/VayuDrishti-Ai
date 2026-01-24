import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('vd.auth') === 'true');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('vd.role')); // 'admin', 'industry', 'home'

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('vd.auth', 'true');
    localStorage.setItem('vd.role', role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('vd.auth');
    localStorage.removeItem('vd.role');
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
                  <Route path="/dashboard" element={<Dashboard userRole={userRole} />} />
                  <Route path="/analytics" element={<Analytics userRole={userRole} />} />
                  <Route path="/alerts" element={<Alerts userRole={userRole} />} />
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
