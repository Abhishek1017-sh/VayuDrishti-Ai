import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BarChart3, 
  AlertTriangle, 
  Settings, 
  LogOut,
  Wind,
  Moon,
  Sun
} from 'lucide-react';
import { useState, useEffect } from 'react';

function Layout({ children, userRole, onLogout }) {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <header className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Wind className="w-8 h-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  VayuDrishti AI
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Air Quality Monitoring
                </p>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {userRole} User
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative"
                >
                  <div className={`
                    flex items-center space-x-2 px-4 py-3 rounded-t-lg transition-colors
                    ${isActive 
                      ? 'bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                    <span className="font-medium hidden sm:inline">{item.label}</span>
                  </div>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2026 VayuDrishti AI. IoT-based Air Quality Monitoring System.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
