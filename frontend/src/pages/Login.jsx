import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wind, User, Building2, Home } from 'lucide-react';

function Login({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'admin',
      name: 'Admin',
      icon: User,
      description: 'Full system access and control',
      color: 'bg-purple-500',
    },
    {
      id: 'industry',
      name: 'Industry',
      icon: Building2,
      description: 'Industrial facility monitoring',
      color: 'bg-blue-500',
    },
    {
      id: 'home',
      name: 'Home User',
      icon: Home,
      description: 'Residential air quality tracking',
      color: 'bg-green-500',
    },
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleLogin = () => {
    if (selectedRole) {
      onLogin(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex justify-center mb-4"
          >
            <div className="bg-primary-600 p-4 rounded-2xl shadow-lg">
              <Wind className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
          >
            VayuDrishti AI
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 dark:text-gray-400"
          >
            IoT-based Air Quality Monitoring & Automation System
          </motion.p>
        </div>

        {/* Role Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-dark-border"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Select Your Role
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {roles.map((role, index) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <motion.button
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`
                    p-6 rounded-xl border-2 transition-all duration-300
                    ${isSelected
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 scale-105'
                      : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div className={`${role.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {role.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {role.description}
                  </p>
                </motion.button>
              );
            })}
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            onClick={handleLogin}
            disabled={!selectedRole}
            className={`
              w-full py-3 rounded-lg font-semibold transition-all duration-300
              ${selectedRole
                ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {selectedRole ? 'Continue to Dashboard' : 'Select a role to continue'}
          </motion.button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Demo Mode - No authentication required
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center"
        >
          <div className="text-gray-600 dark:text-gray-400">
            <div className="font-semibold mb-1">Real-time Monitoring</div>
            <div className="text-sm">Live AQI updates</div>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            <div className="font-semibold mb-1">Smart Automation</div>
            <div className="text-sm">Automatic corrective actions</div>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            <div className="font-semibold mb-1">Advanced Analytics</div>
            <div className="text-sm">Trend analysis & insights</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;
