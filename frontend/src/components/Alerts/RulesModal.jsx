import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, AlertCircle, Edit2, Save } from 'lucide-react';

const RulesModal = ({ isOpen, onClose }) => {
  const [rules, setRules] = useState([
    {
      id: 1,
      name: 'Critical Smoke Alert',
      condition: 'smoke > 400',
      actions: ['LED_ON', 'FAN_ON', 'SEND_NOTIFICATION'],
      severity: 'critical',
      enabled: true
    },
    {
      id: 2,
      name: 'High Temperature Warning',
      condition: 'temperature > 30',
      actions: ['FAN_ON', 'SEND_NOTIFICATION'],
      severity: 'warning',
      enabled: true
    },
    {
      id: 3,
      name: 'Low Humidity Alert',
      condition: 'humidity < 30',
      actions: ['SEND_NOTIFICATION'],
      severity: 'info',
      enabled: false
    }
  ]);

  const [editingRule, setEditingRule] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    condition: '',
    actions: [],
    severity: 'warning',
    enabled: true
  });

  const handleDeleteRule = (id) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const handleToggleRule = (id) => {
    setRules(rules.map(rule =>
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const handleAddRule = () => {
    if (newRule.name && newRule.condition && newRule.actions.length > 0) {
      setRules([...rules, { ...newRule, id: Date.now() }]);
      setNewRule({
        name: '',
        condition: '',
        actions: [],
        severity: 'warning',
        enabled: true
      });
      setShowAddForm(false);
    }
  };

  const handleToggleAction = (action) => {
    setNewRule(prev => ({
      ...prev,
      actions: prev.actions.includes(action)
        ? prev.actions.filter(a => a !== action)
        : [...prev.actions, action]
    }));
  };

  const availableActions = [
    { value: 'LED_ON', label: 'Turn LED On' },
    { value: 'FAN_ON', label: 'Turn Fan On' },
    { value: 'PUMP_ON', label: 'Turn Pump On' },
    { value: 'SEND_NOTIFICATION', label: 'Send Notification' },
    { value: 'SEND_EMAIL', label: 'Send Email' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div>
              <h2 className="text-2xl font-bold text-white">Automation Rules</h2>
              <p className="text-gray-400 text-sm mt-1">Configure alert conditions and automated actions</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
            {/* Add New Rule Button */}
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus size={20} />
                Add New Rule
              </button>
            )}

            {/* Add Rule Form */}
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
              >
                <h3 className="text-white font-semibold mb-4">Create New Rule</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Rule Name</label>
                    <input
                      type="text"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="e.g., Critical Smoke Alert"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Condition</label>
                    <input
                      type="text"
                      value={newRule.condition}
                      onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="e.g., smoke > 400 or temperature > 30"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Severity</label>
                    <select
                      value={newRule.severity}
                      onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="critical">Critical</option>
                      <option value="warning">Warning</option>
                      <option value="info">Info</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Actions</label>
                    <div className="space-y-2">
                      {availableActions.map(action => (
                        <label key={action.value} className="flex items-center gap-2 text-gray-300">
                          <input
                            type="checkbox"
                            checked={newRule.actions.includes(action.value)}
                            onChange={() => handleToggleAction(action.value)}
                            className="w-4 h-4 rounded"
                          />
                          {action.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddRule}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Save size={18} />
                      Save Rule
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Existing Rules */}
            <div className="space-y-3">
              {rules.map((rule) => (
                <motion.div
                  key={rule.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-slate-800/50 border ${
                    rule.enabled ? 'border-slate-700/50' : 'border-slate-700/20'
                  } rounded-lg p-4 ${!rule.enabled && 'opacity-50'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold">{rule.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          rule.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                          rule.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {rule.severity}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          rule.enabled ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                        }`}>
                          {rule.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm font-mono mb-2">
                        Condition: <span className="text-cyan-400">{rule.condition}</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {rule.actions.map((action, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs"
                          >
                            {action.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                          rule.enabled
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                        }`}
                      >
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {rules.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No automation rules configured</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RulesModal;
