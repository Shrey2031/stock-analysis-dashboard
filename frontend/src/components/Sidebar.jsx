import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Wallet, TrendingUp, AlertTriangle } from 'lucide-react';  // NEW

function Sidebar({ portfolio }) {
  const totalValue = portfolio.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <motion.aside 
      initial={{ x: -250 }} 
      animate={{ x: 0 }} 
      className="w-64 bg-gray-800/50 backdrop-blur-md border-r border-white/10 flex flex-col p-4 h-full z-20"
    >
      <nav className="space-y-2 mb-8">
        <motion.a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
          <BarChart3 className="w-5 h-5" />
          <span>Dashboard</span>
        </motion.a>
        <motion.a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10">
          <Wallet className="w-5 h-5" />
          <span>Portfolio</span>
        </motion.a>
        <motion.a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10">
          <TrendingUp className="w-5 h-5" />
          <span>Stocks</span>
        </motion.a>
      </nav>
      <div className="flex-1">
        <h3 className="font-bold mb-4 flex items-center space-x-2">
          <Wallet className="w-5 h-5" />
          <span>Portfolio</span>
        </h3>
        <div className="space-y-2">
          {portfolio.map((item, idx) => (
            <motion.div 
              key={idx} 
              className="flex justify-between p-2 bg-white/5 rounded text-sm"
              whileHover={{ scale: 1.02 }}
            >
              <span>{item.symbol}: {item.shares} shares</span>
              <span className={item.value > 0 ? 'text-green-400' : 'text-red-400'}>
                ${item.value?.toFixed(2) || 'N/A'}
              </span>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg">
          <p className="text-sm opacity-90">Total Value: ${totalValue.toFixed(2)}</p>
        </div>
      </div>
    </motion.aside>
  );
}

export default Sidebar;