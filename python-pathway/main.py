import pandas as pd
import json
import requests
from dotenv import load_dotenv
import os
from utils.data_fetch import fetch_multiple_symbols
from utils.anomaly_detect import detect_anomalies, get_latest_anomaly
from utils.rag import generate_rag_insight

load_dotenv()

# Config
SYMBOLS = ['AAPL', 'TSLA', 'GOOGL']  # Default symbols; override with env or arg
PERIOD = '1d'
INTERVAL = '5m'  # For near-real-time
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000')
BACKEND_ENDPOINT = f"{BACKEND_URL}/api/stocks/update"
HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': os.getenv('BACKEND_AUTH_TOKEN', '')  # Optional
}

def process_symbol(symbol):
    """Process one symbol: Fetch, analyze, return result dict."""
    print(f"Processing {symbol}...")
    data = fetch_multiple_symbols([symbol], period=PERIOD, interval=INTERVAL)[symbol]
    if data.empty:
        return {'symbol': symbol, 'error': 'No data fetched'}
    
    # Technical indicators (using ta lib)
    from ta.momentum import RSIIndicator
    from ta.trend import SMAIndicator
    data['SMA_20'] = SMAIndicator(data['Close'], window=20).sma_indicator()
    data['RSI'] = RSIIndicator(data['Close'], window=14).rsi()
    
    # Anomaly detection
    data = detect_anomalies(data)
    latest_anomaly = get_latest_anomaly(data)
    
    # RAG insight
    insight = generate_rag_insight(data, symbol)
    
    # Latest data
    latest = data.iloc[-1]
    change_pct = ((latest['Close'] - data['Close'].iloc[-2]) / data['Close'].iloc[-2] * 100) if len(data) > 1 else 0
    
    result = {
        'symbol': symbol,
        'current_price': float(latest['Close']),
        'volume': int(latest['Volume']),
        'sma_20': float(latest['SMA_20']) if not pd.isna(latest['SMA_20']) else None,
        'rsi': float(latest['RSI']) if not pd.isna(latest['RSI']) else None,
        'change_percent': float(change_pct),
        'anomaly': latest_anomaly['anomaly'],
        'anomaly_score': latest_anomaly['anomaly_score'],
        'insight': insight,
        'timestamp': pd.Timestamp.now().isoformat()
    }
    return result

def send_to_backend(results):
    """Send processed data to backend."""
    for result in results:
        try:
            response = requests.post(BACKEND_ENDPOINT, json=result, headers=HEADERS)
            if response.status_code == 201:
                print(f"Sent {result['symbol']} to backend: OK")
            else:
                print(f"Backend error for {result['symbol']}: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Failed to send {result['symbol']}: {e}")

def main():
    """Main function: Process symbols and send."""
    results = []
    for symbol in SYMBOLS:
        result = process_symbol(symbol)
        if 'error' not in result:
            results.append(result)
    
    # Print results (for logging)
    print("Processed Results:")
    for r in results:
        print(json.dumps(r, indent=2))
    
    # Send to backend (if configured)
    if BACKEND_URL and BACKEND_ENDPOINT:
        send_to_backend(results)
    else:
        print("No backend configured; skipping send.")

if __name__ == '__main__':
    main()