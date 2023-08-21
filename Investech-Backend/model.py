import concurrent.futures
import time
import numpy as np
import pandas as pd
from pymongo import MongoClient
from statsmodels.tsa.arima.model import ARIMA
import joblib
from mongdbCLI import get_data

mongo_url = "mongodb+srv://badshah:Badshahboy52@cluster0.icj6b.mongodb.net/?retryWrites=true&w=majority"  # Replace with your MongoDB URL
mongo_db_name = "StockData"  # Replace with your MongoDB database name
client = MongoClient(mongo_url)
db = client[mongo_db_name]


def train_arima_model(data):
    # ARIMA does not require normalization, so we skip that step.

    # Initialize ARIMA model
    model = ARIMA(data, order=(5, 1, 0))  # (p, d, q) order of the ARIMA model

    # Fit the ARIMA model to the data
    model_fit = model.fit()

    return model_fit


def save_model(model, model_filename='arima_model.pkl'):
    # Save the trained ARIMA model to disk
    joblib.dump(model, model_filename)


def load_model(model_filename='arima_model.pkl'):
    # Load the trained ARIMA model from disk
    model = joblib.load(model_filename)
    return model


def predict_next_day(model):
    # Make predictions for the next minute
    next_minute_prediction = model.forecast(steps=50)

    return next_minute_prediction


def calculate_mape(actual, predicted):
    # Calculate Mean Absolute Percentage Error (MAPE)
    mape = np.mean(np.abs((actual - predicted) / actual)) * 100
    return mape


def store_data(date, price, change, volume, symbol):
    collection = db[symbol + '-PRED']
    data = {
        "symbol": symbol,
        "date": date,
        "price": str(price),
        "change": change,
        "volume": volume
    }

    # Insert the data into the collection
    print("Inserting")
    try:
        collection.insert_one(data)
        print("Inserted")
    except Exception as e:
        print("error", e)
    # Close the client
    client.close()


def predict(symbol, model):
    data = pd.read_csv(f"./HistoricalData/{symbol}.csv", parse_dates=['Date'])
    data = data['Close'].values.reshape(-1, 1)

    try:
        arima_model = model[symbol]
    except KeyError:
        arima_model = train_arima_model(data)  # Train a new model if it doesn't exist

    livedata = get_data(symbol)
    date, price, change, volumes, symbol = livedata  # Replace this line with code to get the latest minute's data (current price)
    price = pd.to_numeric(price, errors='coerce')
    if not np.isnan(price):
        print("I am here")
        data = np.append(data, price)
        arima_model = train_arima_model(data)
        model[symbol] = arima_model  # Update the model for the symbol
        next_minute_data = predict_next_day(arima_model)
        print(symbol, next_minute_data)
        for price in next_minute_data:
            store_data(date, price, change, volumes, symbol)
    else:
        arima_model = train_arima_model(data)
        next_minute_data = predict_next_day(arima_model)
        print(symbol, next_minute_data)
        for price in next_minute_data:
            store_data(date, price, change, volumes, symbol)


def process_stock(symbol, model):
    predict(symbol, model)


if __name__ == "__main__":
    stock_symbols = ["TATAMOTORS.NS", "SAIL.NS", "^NSEI", "ADANIENT.NS", "BPCL.NS", "RELIANCE.NS"]
    models = {symbol: None for symbol in stock_symbols}
    with concurrent.futures.ProcessPoolExecutor() as executor:
        while True:
            futures=[]
            for stock in stock_symbols:
                future=executor.submit(process_stock, stock, models)
                futures.append(future)

            concurrent.futures.wait(futures)
            time.sleep(3600)
