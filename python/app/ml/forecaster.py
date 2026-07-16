import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import timedelta

def generate_forecast(records, days_to_predict=30):
    """
    Given a list of SQLAlchemy CostRecord objects, predict future costs.
    """
    if not records or len(records) < 5:
        return []

    # Convert to DataFrame
    df = pd.DataFrame([{ "date": r.date, "cost": r.cost } for r in records])
    df['date'] = pd.to_datetime(df['date'])
    
    # Group by date to get daily totals
    daily_df = df.groupby('date')['cost'].sum().reset_index()
    daily_df = daily_df.sort_values('date')

    # Convert date to ordinal (integer) for Linear Regression
    daily_df['day_ordinal'] = daily_df['date'].apply(lambda x: x.toordinal())
    
    X = daily_df[['day_ordinal']].values
    y = daily_df['cost'].values

    # Train model
    model = LinearRegression()
    model.fit(X, y)

    # Predict future
    last_date = daily_df['date'].max()
    future_dates = [last_date + timedelta(days=i) for i in range(1, days_to_predict + 1)]
    
    future_ordinals = np.array([d.toordinal() for d in future_dates]).reshape(-1, 1)
    predictions = model.predict(future_ordinals)

    forecast = []
    for d, p in zip(future_dates, predictions):
        # Don't predict negative costs
        cost_val = max(0, float(p))
        forecast.append({
            "date": d.strftime('%Y-%m-%d'),
            "predicted_cost": round(cost_val, 2)
        })

    return forecast
