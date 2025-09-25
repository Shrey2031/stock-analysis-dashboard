import sys
import json
from utils.data_fetch import fetch_live_data
from utils.anomaly_detect import detect_anomalies
from utils.rag import generate_rag_insight
import pandas as pd
from ta.momentum import RSIIndicator
from ta.trend import SMAIndicator
from dotenv import load_dotenv

load_dotenv()

def perform_analysis(symbol):
    data = fetch_live_data(symbol, period='1d', interval='1m')
    if data.empty:
        return {'error': 'No data fetched'}
    
    # Indicators
    data['SMA_20'] = SMAIndicator(data['Close'], window=20).sma_indicator()
    data['RSI'] = RSIIndicator(data['Close'], window=14).rsi()
    
    # Anomalies
    data = detect_anomalies(data)
    latest = data.iloc[-1]
    anomaly_info = {'anomaly': int(latest['anomaly']), 'anomaly_score': float(latest['anomaly_score'])}
    
    # Insight
    insight = generate_rag_insight(data, symbol)
    
    # Change %
    change_pct = ((latest['Close'] - data['Close'].iloc[-2]) / data['Close'].iloc[-2] * 100) if len(data) > 1 else 0
    
    result = {
        'symbol': symbol,
        'current_price': float(latest['Close']),
        'volume': int(latest['Volume']),
        'sma_20': float(latest['SMA_20']) if not pd.isna(latest['SMA_20']) else None,
        'rsi': float(latest['RSI']) if not pd.isna(latest['RSI']) else None,
        'change_percent': float(change_pct),
        **anomaly_info,
        'insight': insight,
        'timestamp': pd.Timestamp.now().isoformat()
    }
    return result

if __name__ == '__main__':
    symbol = sys.argv[1] if len(sys.argv) > 1 else 'AAPL'
    analysis = perform_analysis(symbol)
    print(json.dumps(analysis))  # Backend parses this