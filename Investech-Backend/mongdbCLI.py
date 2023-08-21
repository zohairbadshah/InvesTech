import datetime
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException
import urllib3
from pymongo import MongoClient
import concurrent.futures

chrome_options = Options()
chrome_options.add_argument("--headless")  # do not show the Chrome window

# MongoDB credentials
mongo_url = "mongodb+srv://badshah:Badshahboy52@cluster0.icj6b.mongodb.net/?retryWrites=true&w=majority"  # Replace with your MongoDB URL
mongo_db_name = "StockData"  # Replace with your MongoDB database name
client = MongoClient(mongo_url)
db = client[mongo_db_name]


def is_working_hours():
    now = datetime.datetime.now()
    start_time = now.replace(hour=9, minute=0, second=0, microsecond=0)
    end_time = now.replace(hour=16, minute=0, second=0, microsecond=0)
    return start_time <= now <= end_time


def xpath_element(xpath):
    try:
        element = driver.find_element(By.XPATH, xpath)
    except NoSuchElementException:
        element = []
    return element


def real_time_price(stock_code):
    global driver
    driver = webdriver.Chrome(options=chrome_options)
    global one_year_target, volume
    url = 'https://finance.yahoo.com/quote/' + stock_code + '?p=' + stock_code + '&.tsrc=fin-srch'
    driver.get(url)
    time.sleep(5)
    # // Price and Change
    xpath = '//*[@id="quote-header-info"]/div[3]/div[1]/div'
    stock_proce_info = xpath_element(xpath)
    time.sleep(5)
    if stock_proce_info != []:
        stock_price_temp = stock_proce_info.text.split()[0]
        if stock_price_temp.find('+') != -1:
            price = stock_price_temp.split('+')[0]
            try:
                change = '+' + stock_price_temp.split('+')[1] + ' ' + stock_proce_info.text.split()[1]
            except IndexError:
                change = []
        elif stock_price_temp.find('-') != -1:
            price = stock_price_temp.split('-')[0]
            try:
                change = '-' + stock_price_temp.split('+')[1] + ' ' + stock_proce_info.text.split()[1]
            except IndexError:
                change = []
        else:
            price, change = [], []
    else:
        price, change = [], []

    # Volume
    xpath = '//*[@id="quote-summary"]/div[1]/table'
    volume_temp = xpath_element(xpath)
    if volume_temp != []:
        # volume=volume_temp.text.split()[-4]

        for i, text in enumerate(volume_temp.text.split()):
            if text == "Volume":
                volume = volume_temp.text.split()[i + 1]
                break
            else:
                volume = []
    else:
        volume_temp = []

    # One year Target
    xpath = '//*[@id="quote-summary"]/div[2]'
    target_temp = xpath_element(xpath)
    if target_temp != []:
        # volume=volume_temp.text.split()[-4]

        for i, text in enumerate(target_temp.text.split()):
            if text == "Est":
                if target_temp.text.split()[i + 1] != 'N/A':
                    one_year_target = target_temp.text.split()[i + 1]
                else:
                    one_year_target = []
                break
            else:
                one_year_target = []
    else:
        target_temp = []
    return price, change, volume, one_year_target


# def before_request():
#     # Check if it is within working hours. If not, return a response indicating that the service is unavailable.
#     if not is_working_hours():
#         return jsonify({'message': 'Service is only available from 9 AM to 4 PM'}), 503
def get_data(symbol):
    driver = webdriver.Chrome(options=chrome_options)
    try:
        info = []
        time_stamp = datetime.datetime.now()
        time_stamp = time_stamp.strftime("%Y-%m-%d %H:%M:%S")

        price, change, volume, one_year_target = real_time_price(symbol)
        if not price:
            print(f"Price is null for {symbol}. Skipping...")
            return None
        info.append(price)
        info.extend([change])
        info.extend([volume])
        # info.extend([one_year_target])
        info.extend([symbol])
        col = [time_stamp]
        col.extend(info)
        return col

    except urllib3.exceptions.MaxRetryError or ConnectionRefusedError as e:
        return e
    finally:
        driver.quit()


def store_data(date, price, change, volume, symbol):
    collection = db[symbol]

    data = {
        "symbol": symbol,
        "date": date,
        "price": price,
        "change": change,
        "volume": volume
    }

    # Insert the data into the collection
    print("Inserting")
    collection.insert_one(data)

    # Close the client
    client.close()


def process_stock_data(stocks):
    data = get_data(stocks)
    date, price, change, volumes, symbol = data
    store_data(date, price, change, volumes, stocks)
    # print(symbol,price)
    print("Success")


if __name__ == "__main__":
    # app.run()
    Stock = ["TATAMOTORS.NS", "SAIL.NS", "^NSEI", "ADANIENT.NS", "BPCL.NS", "RELIANCE.NS"]
    print("Exceuting:")
    # Create a single ThreadPoolExecutor for concurrent web scraping
    # Create a single Process pool for concurrent data storage
    with concurrent.futures.ProcessPoolExecutor() as process_executor:
        while True:
            for stock in Stock:
                process_executor.submit(process_stock_data, stock)
            time.sleep(30)
