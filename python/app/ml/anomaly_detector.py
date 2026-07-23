import pandas as pd
from sklearn.ensemble import IsolationForest


def detect_anomalies(records):
    """
    Uses Isolation Forest to detect anomalous cost spikes in daily totals.
    """
    if not records or len(records) < 10:
        return []

    df = pd.DataFrame([{ "date": r.date, "cost": r.cost } for r in records])
    df['date'] = pd.to_datetime(df['date'])
    
    daily_df = df.groupby('date')['cost'].sum().reset_index()
    daily_df = daily_df.sort_values('date')

    X = daily_df[['cost']].values

    # Train Isolation Forest (contamination = expected proportion of outliers)
    model = IsolationForest(contamination=0.05, random_state=42)
    daily_df['anomaly'] = model.fit_predict(X)

    # In scikit-learn, -1 indicates an anomaly
    anomalies = daily_df[daily_df['anomaly'] == -1]

    results = []
    for _, row in anomalies.iterrows():
        results.append({
            "date": row['date'].strftime('%Y-%m-%d'),
            "cost": round(row['cost'], 2),
            "severity": "high" if row['cost'] > daily_df['cost'].mean() * 2 else "medium"
        })

    return results
