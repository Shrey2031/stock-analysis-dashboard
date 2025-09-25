import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Info, Bell, X, Trash2 } from 'lucide-react';  // Icons for alerts and actions

function AlertsPanel({ alerts }) {
  const [isOpen, setIsOpen] = useState(true);  // Toggle panel visibility
  const [displayAlerts, setDisplayAlerts] = useState(alerts || []);  // Local state for management

  // Sync with props (new alerts from App.js)
  useEffect(() => {
    setDisplayAlerts(alerts || []);
  }, [alerts]);

  // Auto-scroll to bottom on new alerts
  useEffect(() => {
    const panel = document.getElementById('alerts-panel');
    if (panel) {
      panel.scrollTop = panel.scrollHeight;
    }
  }, [displayAlerts]);

  // Get icon and color by alert type
  const getAlertProps = (type) => {
    switch (type) {
      case 'anomaly':
        return { icon: AlertCircle, color: 'text-red-400 border-red-500/30 bg-red-900/20' };
      case 'warning':
        return { icon: Bell, color: 'text-yellow-400 border-yellow-500/30 bg-yellow-900/20' };
      case 'info':
      default:
        return { icon: Info, color: 'text-blue-400 border-blue-500/30 bg-blue-900/20' };
    }
  };

  // Close individual alert
  const closeAlert = (index) => {
    setDisplayAlerts(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all alerts
  const clearAll = () => {
    setDisplayAlerts([]);
  };

  if (!isOpen || displayAlerts.length === 0) {
    return null;  // Hidden if closed and no alerts
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed bottom-6 right-6 z-50 w-80 max-h-96"  // Fixed bottom-right, max height with scroll
    >
      {/* Panel Header */}
      <motion.div
        className="glass-card p-4 rounded-t-xl flex justify-between items-center mb-0"  // Glass from CSS
        initial={{ y: -20 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-yellow-400" />
          <h4 className="font-bold text-lg">Alerts ({displayAlerts.length})</h4>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearAll}
            disabled={displayAlerts.length === 0}
            className="p-1 text-gray-400 hover:text-red-400 disabled:opacity-50 transition-colors"
            title="Clear All"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Alerts List (Scrollable) */}
      <div
        id="alerts-panel"
        className="glass-card rounded-b-xl overflow-y-auto max-h-72 p-0"  // Scrollable body
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#6b7280 #374151' }}
      >
        <AnimatePresence>
          {displayAlerts.map((alert, index) => {
            const { icon: Icon, color } = getAlertProps(alert.type);
            const timestamp = alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString() : 'Just now';

            return (
              <motion.div
                key={`${alert.type}-${index}`}  // Unique key
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}  // Staggered entry
                className={`p-4 border-b border-white/10 last:border-b-0 flex items-start space-x-3 hover:bg-white/5 transition-colors ${color}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm leading-tight">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{timestamp}</p>
                </div>
                <button
                  onClick={() => closeAlert(index)}
                  className="p-1 text-gray-400 hover:text-white ml-2 flex-shrink-0 transition-colors"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* No Alerts Message */}
        {displayAlerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center text-gray-500"
          >
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No alerts at the moment.</p>
            <p className="text-xs">Real-time monitoring active.</p>
          </motion.div>
        )}
      </div>

      {/* Reopen Button (Floating) - If closed */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 glass-card rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          title="Show Alerts"
        >
          <Bell className="w-6 h-6 text-yellow-400" />
        </motion.button>
      )}
    </motion.div>
  );
}

export default AlertsPanel;