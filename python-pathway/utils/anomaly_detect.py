import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

def detect_anomalies(data):
    """
    Detect anomalies in stock data.
    - Input: DataFrame with 'Close', 'Volume' columns
    - Output: DataFrame with added 'anomaly' (-1 for anomaly, 1 for normal) and 'anomaly_score' (lower = more anomalous)
    """
    if len(data) < 10:  # Need min data points
        data['anomaly'] = 1
        data['anomaly_score'] = 0.0
        return data
    
    model = IsolationForest(contamination=0.05, random_state=42)  # 5% anomalies
    features = data[['Close', 'Volume']].fillna(method='ffill').fillna(0)  # Handle NaNs
    predictions = model.fit_predict(features)
    scores = model.decision_function(features)  # Outlier scores (-1 to 1)
    
    data['anomaly'] = predictions
    data['anomaly_score'] = scores
    return data

def get_latest_anomaly(data):
    """
    Get anomaly info for the latest row.
    Returns: Dict {'anomaly': int, 'anomaly_score': float}
    """
    if data.empty:
        return {'anomaly': 1, 'anomaly_score': 0.0}
    latest = data.iloc[-1]
    return {'anomaly': int(latest['anomaly']), 'anomaly_score': float(latest['anomaly_score'])}