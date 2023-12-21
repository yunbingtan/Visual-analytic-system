import sys
import time
import sqlite3
import pandas as pd
import math
import os
import json
import flask
from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/sqlquery', methods=["GET", "POST"])
def sqlquery():
    if request.method == "POST":
        received_data = request.get_json()

        # connect to database
        os.remove("sensor_data.db")
        conn = sqlite3.connect("sensor_data.db")
        conn.row_factory = sqlite3.Row

        # create table
        sql_create_table = """CREATE TABLE IF NOT EXISTS sensor_data (
                        id INT primary key,
                        TimeStamp TEXT,
                        car_id TEXT,
                        car_type TEXT,
                        gate_name TEXT,
                        season TEXT,
                        x INT,
                        y INT
                    );"""

        if conn is not None:
            c = conn.cursor()
            c.execute(sql_create_table)
            df = pd.read_csv("data.csv")
            df.to_sql('sensor_data', conn, if_exists='append', index=False)

        # excute query string
        c.execute(received_data)
        rows = c.fetchall()

        data = []
        for row in rows:
            data.append(dict(row))

        barchart_data = barchart_processing(data)
        piechart_data = process_data_pie_chart_2(data)
        map_data = map_data_process(data)
        timeline_data = count_cars_per_day(data)

        full_data = [data, barchart_data, piechart_data, map_data, timeline_data]

        # end connection to database
        conn.close()
        
        return flask.Response(response = json.dumps(full_data) , status=201)

def barchart_processing(data):
    barData = [
    { "season": "spring", "night": 0, "total": 0, "avgTime": 0 },
    { "season": "summer", "night": 0, "total": 0, "avgTime": 0 },
    { "season": "fall", "night": 0, "total": 0, "avgTime": 0 },
    { "season": "winter", "night": 0, "total": 0, "avgTime": 0 },
    ]
    
    df = pd.DataFrame(data)
    df['TimeStamp'] = pd.to_datetime(df['TimeStamp'])
    for i in range(len(barData)):
        barData[i]['total'] = df[df['season'] == barData[i]['season']].shape[0]
        barData[i]['night'] = df[(df['season'] == barData[i]['season']) & (df['TimeStamp'].dt.hour > 18)].shape[0]

    # Sort the data by car_id and Timestamp
    df = df.sort_values(['car_id', 'TimeStamp'])

    # # Calculate the time duration between each pair of sensor records for every unique car_id
    df['time_duration'] = df.groupby('car_id')['TimeStamp'].diff()

    df = df[~df['time_duration'].isna()].sort_values(['time_duration'], ascending=False)
    
    # # Calculate the average time duration for each season, to mins
    for i in range(len(barData)):
        if not math.isnan(df[df['season'] == barData[i]['season']]['time_duration'].mean().total_seconds()):
            barData[i]['avgTime'] = df[df['season'] == barData[i]['season']]['time_duration'].mean().total_seconds()/60

    for i in range(len(barData)):
        barData[i]['season'] =  barData[i]['season'].capitalize()

    return barData

def process_data_pie_chart_2(data):
    if len(data) == 0:
        interval_labels = [
            "1 min",
            "1 min - 30 min",
            "30 min - 1 hr",
            "1 hr - 24 hr",
            "1 day - 7 days",
            "Over 7 days",
        ]
        return [{"label": label, "count": 0} for label in interval_labels]
    df = pd.DataFrame(data)
    df['TimeStamp'] = pd.to_datetime(df['TimeStamp'])

    df = df.sort_values(['car_id', 'TimeStamp'])

    df['time_duration'] = df.groupby('car_id')['TimeStamp'].diff()

    df = df[~df['time_duration'].isna()].sort_values(['time_duration'], ascending=False)
    df['time_duration_seconds'] = df['time_duration'].apply(lambda x: x.total_seconds())
    intervals = [
        0,        # 0 seconds
        60,       # 1 minute
        1800,     # 30 minutes
        3600,     # 1 hour
        86400,    # 1 day
        604800,   # 1 week
        float("inf"),  # infinity (for any time duration longer than 1 week)
    ]
    interval_labels = [
        "1 min",
        "1 min - 30 min",
        "30 min - 1 hr",
        "1 hr - 24 hr",
        "1 day - 7 days",
        "Over 7 days",
    ]

    counts = [0] * len(interval_labels)

    for time_duration_seconds in df['time_duration_seconds']:
        for i, upper_bound in enumerate(intervals[1:]):
            if time_duration_seconds < upper_bound:
                counts[i] += 1
                break

    result = []
    for i, count in enumerate(counts):
        result.append({"label": interval_labels[i], "count": count})

    return result

def map_data_process(data):
    if len(data) == 0:
        emptyData =[{ "gate": "gate2", "x": 126, "y": 265, "recordCount": 0 }]
        return emptyData
    df = pd.DataFrame(data)
    df_xy = pd.read_csv('gate_xy.csv')

    recordCount = df.groupby('gate_name')["id"].nunique().agg(pd.DataFrame)
    recordCount = recordCount.rename(columns={recordCount.columns[0]: 'recordCount'})
    
    df_map = pd.merge(recordCount, df_xy, on=['gate_name'])
    return df_map.to_dict('records')

def count_cars_per_day(data):
    df = pd.DataFrame(data, columns=["id", "TimeStamp", "car_id", "car_type", "gate_name", "season", "x", "y"])
    df = df.dropna()
    df['TimeStamp'] = pd.to_datetime(df['TimeStamp'])
    df['date'] = df['TimeStamp'].dt.date
    daily_count = df.groupby(['date']).size().reset_index(name='count')
    result_json = daily_count.to_json(orient='records', date_format='iso')
    return result_json

if __name__ == "__main__":
    app.debug = True
    app.run("localhost", 6969)