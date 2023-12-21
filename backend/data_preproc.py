import pandas as pd

df = pd.read_csv('data_original.csv')
df = df.rename(columns={"gate-name": "gate_name"})
df_xy = pd.read_csv('gate_xy.csv')
def get_season(month):
    if month in [3, 4, 5]:
        return 'spring'
    elif month in [6, 7, 8]:
        return 'summer'
    elif month in [9, 10, 11]:
        return 'fall'
    else:
        return 'winter'

# Add a new column for the season
df['Timestamp'] = pd.to_datetime(df['Timestamp'])
df['season'] = df['Timestamp'].dt.month.apply(get_season)
df_trans = pd.merge(df, df_xy, on='gate_name', how='left')
df_trans = df_trans.rename(columns={"car-id": "car_id", "car-type": "car_type"})
df_trans.index.rename('id', inplace=True)
df_trans.to_csv("./data.csv", index=True)