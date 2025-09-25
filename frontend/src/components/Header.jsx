import React, { useState } from 'react';
import { Search, User, LogOut } from 'lucide-react';  // NEW: Icons

function Header({ onSearch, loading }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) onSearch(searchTerm.toUpperCase());
  };

  return (
    <motion.header 
      initial={{ y: -50 }} 
      animate={{ y: 0 }} 
      className="glass-card p-4 flex justify-between items-center shadow-2xl z-10"
    >
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Stock Analyzer
        </h1>
      </div>
      // In Header return (add before search form)
    <button 
     onClick={onMenuToggle}  // NEW prop
     className="md:hidden p-2"  // Mobile-only
     >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
</button>
      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8 relative">
        <div className="flex items-center bg-white/5 rounded-lg p-2">
          <Search className="w-5 h-5 text-gray-400 ml-3" />
          <input
            type="text"
            placeholder="Search symbol (e.g., AAPL) for real-time analysis"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none text-white placeholder-gray-400 pl-2"
            disabled={loading}
          />
          {loading && <div className="absolute right-3 text-blue-400">Searching...</div>}
        </div>
      </form>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>John Doe</span>
        </div>
        <button 
          onClick={() => { localStorage.removeItem('token'); window.location.reload(); }}
          className="flex items-center space-x-2 bg-red-600/80 hover:bg-red-500 p-2 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </motion.header>
  );
}

export default Header;