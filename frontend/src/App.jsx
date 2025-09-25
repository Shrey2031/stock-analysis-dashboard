import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';  // NEW: Animations
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AlertsPanel from './components/AlertPanel';
import MainDashboard from './components/MainDashboard';
import { fetchAnalysis, fetchLiveAnalysis } from './services/api';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [currentSymbol, setCurrentSymbol] = useState('AAPL');
  const [loading, setLoading] = useState(false);
    // In App.js (add state and logic)
  const [sidebarOpen, setSidebarOpen] = useState(false);  // NEW: Mobile toggle
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Existing useEffects for fetch, polling, socket (unchanged from previous)
  useEffect(() => {
    if (isAuthenticated) {
      loadAnalysis(currentSymbol);
    }
  }, [currentSymbol, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        fetchLiveAnalysis([currentSymbol])
          .then(([newAnalysis]) => {
            setAnalysis(newAnalysis);
            setStocks(prev => prev.map(stock => 
              stock.symbol === currentSymbol ? { ...stock, close: newAnalysis.current_price } : stock
            ));
            if (newAnalysis.anomaly === -1) {
              const alertMsg = `Anomaly detected in ${currentSymbol}`;
              setAlerts(prev => [...prev, { type: 'anomaly', message: alertMsg }]);
              toast.warn(alertMsg);
            }
          })
          .catch(err => toast.error('Live analysis failed'));
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [currentSymbol, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      socket.emit('joinAnalysis', currentSymbol);
      socket.on('liveAnalysis', (data) => {
        setAnalysis(data);
        setStocks(prev => [...prev.filter(s => s.symbol !== currentSymbol), 
          { ...data, date: new Date().toISOString().split('T')[0], volume: data.volume, close: data.current_price, anomaly: data.anomaly }
        ]);
        if (data.anomaly === -1) toast.warning(`Real-time anomaly in ${data.symbol}`);
      });
      socket.on('analysisUpdate', (data) => {
        setAnalysis(data);
        toast.info(`Analysis updated for ${data.symbol}`);
      });
      socket.on('analysisError', (err) => toast.error(`Analysis error: ${err.error}`));
      return () => {
        socket.off('liveAnalysis');
        socket.off('analysisUpdate');
        socket.off('analysisError');
      };
    }
  }, [currentSymbol, isAuthenticated]);

  const loadAnalysis = async (symbol) => {
    setLoading(true);
    try {
      const data = await fetchAnalysis(symbol);
      setAnalysis(data);
      setCurrentSymbol(symbol);
      toast.success(`Analysis loaded for ${symbol}`);
    } catch (error) {
      toast.error('Failed to fetch analysis');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" />;



// In Header component (pass setSidebarOpen as prop)


// In main return (wrap sidebar)


// Update main div for mobile overlay


// For mobile overlay (add this after Sidebar)

  return (
    <Router>
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'md:ml-0 ml-64' : ''}`}>
        {/* <Sidebar portfolio={portfolio} /> */}
        <Sidebar portfolio={portfolio} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          {sidebarOpen && (
         <motion.div 
       className="fixed inset-0 bg-black/50 z-30 md:hidden"  // Mobile-only overlay
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
      onClick={() => setSidebarOpen(false)}
      />
     )}

        <div className="flex-1 flex flex-col">
          {/* <Header onSearch={loadAnalysis} loading={loading} /> */}
          <Header onSearch={loadAnalysis} loading={loading} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <motion.main 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="flex-1 overflow-y-auto p-4 space-y-6"
          >
            <Routes>
              <Route path="/" element={
                <MainDashboard 
                  stocks={stocks} 
                  analysis={analysis} 
                  currentSymbol={currentSymbol}
                  loading={loading}
                />
              } />
            </Routes>
          </motion.main>
        </div>
        <AlertsPanel alerts={alerts} />
        <ToastContainer position="top-right" theme="dark" autoClose={3000} className="toast-container" />
      </div>
    </Router>
  );
}

export default App;
