import yfinance as yf
import pandas as pd
from dotenv import load_dotenv
import os

load_dotenv()

def fetch_live_data(symbol, period='1d', interval='1m'):
    """
    Fetch real-time or historical stock data.
    - period: '1d', '5d', '1mo' (default 1d)
    - interval: '1m', '5m', '1h' (for real-time)
    Returns: pandas DataFrame with OHLCV (Open, High, Low, Close, Volume)
    """
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period=period, interval=interval)
        if data.empty:
            raise ValueError(f"No data for {symbol}")
        data.reset_index(inplace=True)  # Make Date a column
        return data
    except Exception as e:
        print(f"Error fetching data for {symbol}: {e}")
        return pd.DataFrame()

def fetch_multiple_symbols(symbols, **kwargs):
    """
    Fetch for multiple symbols.
    Returns: Dict of {symbol: DataFrame}
    """
    results = {}
    for symbol in symbols:
        results[symbol] = fetch_live_data(symbol, **kwargs)
    return results