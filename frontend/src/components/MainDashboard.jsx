import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  Cell
} from 'recharts';
import {
  TrendingUp,
  AlertCircle,
  Brain,
  DollarSign,
  Percent,
  Activity,
  BarChart3,
  Volume2,
  Zap
} from 'lucide-react';  // Icons for metrics and sections

function MainDashboard({ stocks, analysis, currentSymbol, loading }) {
  // Prepare chart data (integrates analysis for SMA)
  const chartData = stocks.map(stock => ({
    date: stock.date,
    close: stock.close,
    volume: stock.volume || 0,
    sma: analysis?.sma_20 || stock.close  // Overlay SMA from analysis
  }));

  // Anomalies from stocks + live check
  const anomalies = stocks.filter(stock => stock.anomaly === -1);
  const hasLiveAnomaly = analysis?.anomaly === -1;

  // Summary object from analysis (fallback if no data)
  const summary = analysis ? {
    change: analysis.change_percent.toFixed(2),
    price: analysis.current_price.toFixed(2),
    symbol: analysis.symbol,
    rsi: analysis.rsi || 50,
    sma: analysis.sma_20 ? analysis.sma_20.toFixed(2) : 'N/A',
    anomalyScore: analysis.anomaly_score ? analysis.anomaly_score.toFixed(3) : '0.000'
  } : {
    change: '0.00',
    price: '150.50',
    symbol: currentSymbol,
    rsi: 50,
    sma: 'N/A',
    anomalyScore: '0.000'
  };

  // RSI color logic (red: overbought >70, green: oversold <30, yellow: neutral)
  const getRsiColor = (rsi) => {
    if (rsi > 70) return '#ef4444';  // Red
    if (rsi < 30) return '#10b981';  // Green
    return '#f59e0b';  // Yellow
  };

  // Custom tooltip for charts
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-white/20 rounded-lg p-3 text-sm">
          <p className="font-bold">{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} className="capitalize" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="loading-skeleton h-24"></div>
          ))}
        </div>
        <div className="loading-skeleton h-48"></div>
        <div className="loading-skeleton h-64"></div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Hero Metrics Grid (5 Cards with Icons and Animations) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
      >
        <motion.div
          className="metric-card"  // From global CSS: glass-card + hover
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <DollarSign className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <h4 className="text-sm opacity-75 mb-1">Current Price</h4>
          <p className="text-2xl font-bold text-blue-400">${summary.price}</p>
        </motion.div>

        <motion.div className="metric-card" whileHover={{ scale: 1.05, y: -5 }}>
          <TrendingUp
            className={`w-8 h-8 mx-auto mb-2 ${
              parseFloat(summary.change) > 0 ? 'text-green-400' : 'text-red-400'
            }`}
          />
          <h4 className="text-sm opacity-75 mb-1">24h Change</h4>
          <p
            className={`text-2xl font-bold ${
              parseFloat(summary.change) > 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {parseFloat(summary.change) > 0 ? '+' : ''}{summary.change}%
          </p>
        </motion.div>

        <motion.div className="metric-card" whileHover={{ scale: 1.05, y: -5 }}>
          <Activity className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h4 className="text-sm opacity-75 mb-1">SMA (20)</h4>
          <p className="text-xl text-green-400">{summary.sma}</p>
        </motion.div>

        <motion.div className="metric-card" whileHover={{ scale: 1.05, y: -5 }}>
          <Percent
            className={`w-8 h-8 mx-auto mb-2`}
            style={{ color: getRsiColor(summary.rsi) }}
          />
          <h4 className="text-sm opacity-75 mb-1">RSI (14)</h4>
          <p className={`text-xl font-bold`} style={{ color: getRsiColor(summary.rsi) }}>
            {summary.rsi.toFixed(1)}
          </p>
        </motion.div>

        <motion.div className="metric-card" whileHover={{ scale: 1.05, y: -5 }}>
          <AlertCircle
            className={`w-8 h-8 mx-auto mb-2 ${
              parseFloat(summary.anomalyScore) < 0 ? 'text-red-400' : 'text-green-400'
            }`}
          />
          <h4 className="text-sm opacity-75 mb-1">Anomaly Score</h4>
          <p
            className={`text-xl ${
              parseFloat(summary.anomalyScore) < 0 ? 'text-red-400' : 'text-green-400'
            }`}
          >
            {summary.anomalyScore}
          </p>
        </motion.div>
      </motion.div>

      {/* 2. RSI Gauge Chart (Radial Bar for Visual Momentum) */}
      {analysis && (
        <motion.div
          className="chart-container"  // Glass card
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="mb-4 font-bold flex items-center space-x-2 text-lg">
            <Percent className="w-5 h-5 text-yellow-400" />
            <span>RSI Momentum Gauge</span>
            {/* <span className="text-sm opacity-75">(Overbought: >70, Oversold: <30)</span> */}
            <span className="text-sm opacity-75">(Overbought: &gt;70, Oversold: &lt;30)</span>
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart
              data={[
                { name: 'Neutral', value: 50, fill: '#f59e0b' },
                { name: 'RSI', value: summary.rsi, fill: getRsiColor(summary.rsi) }
              ]}
              innerRadius="40%"
              outerRadius="80%"
              barSize={20}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                dataKey="value"
                tickLine={false}
                tick={false}
                axisLine={false}
              />
              <RadialBar
                minAngle={15}
                background
                clockWise
                dataKey="value"
                cornerRadius={10}
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />
              </RadialBar>
              <Tooltip content={customTooltip} />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white text-lg font-bold"
              >
                {summary.rsi.toFixed(1)}
              </text>
              <text
                x="50%"
                y="60%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-gray-400 text-sm"
              >
                RSI Score
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* 3. AI Insight Card (RAG-Generated) */}
      {analysis && analysis.insight && (
        <motion.div
          className="insight-card"  // Glass with blue left border
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-bold mb-3 flex items-center space-x-2 text-lg">
            <Brain className="w-5 h-5 text-blue-400" />
            <span>AI Insight (RAG Analysis)</span>
          </h3>
          <p className="text-gray-200 mb-3 italic leading-relaxed">{analysis.insight}</p>
          <p className="text-xs text-gray-500 flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>Generated at {new Date(analysis.timestamp).toLocaleTimeString()}</span>
          </p>
        </motion.div>
      )}

      {/* 4. Live Price Chart with SMA Overlay */}
      <motion.div
        className="chart-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="mb-4 font-bold flex items-center space-x-2 text-lg">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <span>Live Stock Price Chart ({currentSymbol})</span>
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" tickFormatter={(date) => date.slice(5, 10)} />
            <YAxis stroke="#9ca3af" />
            <Tooltip content={customTooltip} />
            <Legend />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Price"
              dot={{ fill: '#3b82f6', strokeWidth: 2 }}
            />
            {analysis?.sma_20 && (
              <Line
                type="monotone"
                dataKey="sma"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="SMA 20"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 5. Volume Bar Chart */}
      <motion.div
        className="chart-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="mb-4 font-bold flex items-center space-x-2 text-lg">
          <Volume2 className="w-5 h-5 text-purple-400" />
          <span>Trading Volume</span>
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip content={customTooltip} />
            <Legend />
            <Bar dataKey="volume" fill="#8b5cf6" name="Volume" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 6. Anomalies Section (Table + Live Highlight) */}
      <motion.div
        className="chart-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="mb-4 font-bold flex items-center space-x-2 text-lg">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span>Anomalies Detected ({anomalies.length + (hasLiveAnomaly ? 1 : 0)})</span>
        </h3>
        
        {/* Live Anomaly Highlight */}
        {hasLiveAnomaly && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="mb-4 p-4 bg-red-900/50 border border-red-500/50 rounded-lg flex items-center space-x-3"
          >
            <AlertCircle className="w-6 h-6 text-red-400" />
            <div>
              <p className="font-bold">Live Anomaly Alert!</p>
              <p className="text-sm text-red-300">
                {currentSymbol}: Score {summary.anomalyScore} (Potential unusual activity)
              </p>
            </div>
          </motion.div>
        )}

        {/* Anomalies Table */}
        {anomalies.length > 0 ? (
          // <div className="overflow-x-auto">
          //   <table className="w-full text-sm">
          //     <thead>
          //       <tr className="border-b border-white/20">
          //         <th className="p-2 text-left">Symbol</th>
          //         <th className="p-2 text-left">Date</th>
          //         <th className="p-2 text-left">Price</th>
          //         <th className="p-2 text-left">Anomaly Score</th>
          //       </tr>
          //     </thead>
          //     <tbody>
          //       {anomalies.map((anomaly, idx) => (
          //         <motion.tr
          //           key={idx}
          //           className="border-b border-white/10 hover:bg-white/5"
          //           whileHover={{ backgroundColor: '#374151' }}
          //         >
          //           <td className="p-2 font-medium">{anomaly.symbol}</td>
          //           <td className="p-2">{anomaly.date}</td>
          //           <td className="p-2">${anomaly.close.toFixed(2)}</td>
          //           <td className="p-2 text-red-400">{anomaly.anomaly_score.toFixed(3)}</td>
          //         </motion.tr>
          //       ))}
          //     </tbody>
          //   </table>
          // </div>
           <div className="space-y-3 md:space-y-0">  {/* NEW: Stack on mobile */}
    {anomalies.map((anomaly, idx) => (
      <motion.div
        key={idx}
        className="glass-card p-4 md:border-b md:border-white/10 md:last:border-b-0 grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-0 text-sm"
        whileHover={{ scale: 1.02 }}
      >
        <div className="font-medium md:border-r md:border-white/10 pr-2">Symbol: {anomaly.symbol}</div>
        <div>Date: {anomaly.date}</div>
        <div>Price: ${anomaly.close.toFixed(2)}</div>
        <div className="text-red-400 md:text-right">Score: {anomaly.anomaly_score.toFixed(3)}</div>
      </motion.div>
    ))}
  </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 py-8"
          >
            No anomalies detected yet. Real-time monitoring active.
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

export default MainDashboard;