import express from 'express';
import { Router } from 'express';
const router = Router();
import User from '../models/user.js';

// Assume a simple in-memory cache for stocks (replace with MongoDB collection or Redis later)
// Or integrate with Python: Use child_process to run 'python main.py' and parse output
let stockCache = [];  // e.g., [{ symbol: 'AAPL', close: 150.50, date: '2023-10-05', anomaly: 0 }]

// GET /api/stocks - Get all stocks (user's preferences or global)
router.get('/', async (req, res) => {
  try {
    // Filter by user's preferences if available
    const userSymbols = req.user?.preferences?.symbols || ['AAPL', 'TSLA'];
    const userStocks = stockCache.filter(stock => userSymbols.includes(stock.symbol));

    // If cache empty, simulate fetch (integrate Python here)
    if (stockCache.length === 0) {
      stockCache = [
        { symbol: 'AAPL', close: 150.50, volume: 58000000, date: '2023-10-05', anomaly: 0 },
        { symbol: 'TSLA', close: 250.00, volume: 120000000, date: '2023-10-05', anomaly: -1 },
      ];
    }

    res.json(userStocks || stockCache);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching stocks.' });
  }
});

// GET /api/stocks/:symbol - Get specific stock
router.get('/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const stock = stockCache.find(s => s.symbol === symbol);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found.' });
    }
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/stocks/update - For Python to push processed data (e.g., anomalies)
router.post('/update', async (req, res) => {
  try {
    const newData = req.body;  // e.g., { symbol: 'AAPL', close: 152.00, anomaly: -1 }
    if (!newData.symbol || typeof newData.close !== 'number') {
      return res.status(400).json({ error: 'Invalid data format.' });
    }

    // Update cache (or save to DB)
    const existingIndex = stockCache.findIndex(s => s.symbol === newData.symbol);
    if (existingIndex > -1) {
      stockCache[existingIndex] = { ...stockCache[existingIndex], ...newData };
    } else {
      stockCache.push(newData);
    }

    // Emit real-time update via WebSocket (from server.js io instance)
    // Pass io as param or use a global event emitter
    req.io.emit('stockUpdate', newData);  // Assumes io passed or global

    // Update user's portfolio if anomaly (optional)
    if (newData.anomaly === -1 && req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { 'preferences.symbols': newData.symbol }
      });
      req.io.emit('alert', { type: 'anomaly', message: `Anomaly in ${newData.symbol}` });
    }

    res.status(201).json({ message: 'Stock updated', data: newData });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating stock.' });
  }
});

// GET /api/stocks/portfolio - User-specific portfolio value (protected)
router.get('/portfolio', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('portfolio');
    if (!user.portfolio || user.portfolio.length === 0) {
      return res.json({ portfolio: [], totalValue: 0 });
    }

    // Calculate values using stockCache
    let totalValue = 0;
    const portfolioWithValue = user.portfolio.map(item => {
      const stock = stockCache.find(s => s.symbol === item.symbol);
      const value = (stock?.close || 0) * item.shares;
      totalValue += value;
      return { ...item.toObject(), currentPrice: stock?.close, value };
    });

    res.json({ portfolio: portfolioWithValue, totalValue: totalValue.toFixed(2) });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching portfolio.' });
  }
});

module.exports = router;