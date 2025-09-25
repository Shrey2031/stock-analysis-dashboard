import asyncio
import time
from dotenv import load_dotenv
import os
import requests
from main import process_symbol  # Reuse main's processor
from utils.data_fetch import fetch_multiple_symbols

load_dotenv()

SYMBOLS = os.getenv('STREAM_SYMBOLS', 'AAPL,TSLA').split(',')
INTERVAL = int(os.getenv('STREAM_INTERVAL', '30'))  # Seconds
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:5000')
BACKEND_ENDPOINT = f"{BACKEND_URL}/api/stocks/update"
HEADERS = {'Content-Type': 'application/json', 'Authorization': os.getenv('BACKEND_AUTH_TOKEN', '')}

async def stream_symbol(symbol):
    """Process and send one symbol."""
    result = process_symbol(symbol)
    if 'error' not in result:
        try:
            response = requests.post(BACKEND_ENDPOINT, json=result, headers=HEADERS)
            print(f"Streamed {symbol}: {response.status_code}")
        except Exception as e:
            print(f"Stream error for {symbol}: {e}")
    else:
        print(f"Stream error for {symbol}: {result['error']}")

async def main_stream():
    """Poll symbols every INTERVAL seconds."""
    print(f"Starting real-time stream for {SYMBOLS} every {INTERVAL}s...")
    while True:
        tasks = [stream_symbol(symbol) for symbol in SYMBOLS]
        await asyncio.gather(*tasks)
        await asyncio.sleep(INTERVAL)

if __name__ == '__main__':
    asyncio.run(main_stream())