import sqlite3
import pandas as pd
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# File DB sẽ được tạo ra ngay bên trong thư mục back_end
DB_NAME = os.path.join(BASE_DIR, "hotel_booking.db")


def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # 1. Tạo bảng người dùng để quản lý tài khoản đăng nhập (OAuth2)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            hashed_password TEXT
        )
    ''')
    # 2. Tạo bảng lịch sử dự đoán khớp chính xác 100% với file ảnh của bạn
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS prediction_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,           
            adr REAL,
            lead_time INTEGER,
            agent REAL,
            previous_cancellations INTEGER,
            deposit_type TEXT,
            confidence REAL,
            timestamp TEXT,
            actual_status INTEGER,
            prediction INTEGER
        )
    ''')
    conn.commit()
    conn.close()

def save_prediction(username: str, data: dict, prediction: int, confidence: float):
    """Lưu dữ liệu đầu vào của khách kèm kết quả dự đoán từ model AI vào CSDL"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    actual_status = -1
    
    # query = '''
    #     INSERT INTO prediction_history (
    #         username, hotel, lead_time, arrival_date_year, arrival_date_month,
    #         arrival_date_week_number, arrival_date_day_of_month, stays_in_weekend_nights,
    #         stays_in_week_nights, adults, children, babies, meal, country,
    #         market_segment, distribution_channel, is_repeated_guest, previous_cancellations,
    #         previous_bookings_not_canceled, reserved_room_type, assigned_room_type,
    #         booking_changes, deposit_type, agent, company, days_in_waiting_list,
    #         customer_type, adr, required_car_parking_spaces, total_of_special_requests,
    #         prediction, confidence, timestamp, actual_status
    #     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    # '''

    query = '''
        INSERT INTO prediction_history (
            username, adr, lead_time, agent, previous_cancellations, deposit_type, prediction, confidence, timestamp, actual_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
'''
    
    cursor.execute(query, (
       
        username,
        data.get("adr"),
        data.get("lead_time"),
        data.get("agent"),
        data.get("previous_cancellations"),
        data.get("deposit_type"),
        prediction,
        confidence,
        timestamp,
        actual_status
    ))
    conn.commit()
    conn.close()

def get_history(username: str = None):
    """Lấy danh sách lịch sử dự đoán từ CSDL"""
    conn = sqlite3.connect(DB_NAME)
    if username:
        df = pd.read_sql_query("SELECT * FROM prediction_history WHERE username = ? ORDER BY id DESC", conn, params=(username,))
    else:
        df = pd.read_sql_query("SELECT * FROM prediction_history ORDER BY id DESC", conn)
    conn.close()
    return df.to_dict(orient="records")

def update_status(record_id: int, actual_status: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    try:
        cursor.execute(
            '''UPDATE prediction_history SET actual_status = ? where id =?''',
            (actual_status, record_id)
            )
        conn.commit()
        return True
    except Exception as e:
        print(f"Lỗi cập nhật db: {e}")
        return False
    finally:
        print(conn)
        conn.close()

# Tự động khởi chạy tạo bảng ngay khi import file này lần đầu
init_db()






















    # hotel TEXT,
            # lead_time INTEGER,
            # arrival_date_year INTEGER,
            # arrival_date_month TEXT,
            # arrival_date_week_number INTEGER,
            # arrival_date_day_of_month INTEGER,
            # stays_in_weekend_nights INTEGER,
            # stays_in_week_nights INTEGER,
            # adults INTEGER,
            # children REAL,
            # babies INTEGER,
            # meal TEXT,
            # country TEXT,
            # market_segment TEXT,
            # distribution_channel TEXT,
            # is_repeated_guest INTEGER,
            # previous_cancellations INTEGER,
            # previous_bookings_not_canceled INTEGER,
            # reserved_room_type TEXT,
            # assigned_room_type TEXT,
            # booking_changes INTEGER,
            # deposit_type TEXT,
            # agent REAL,
            # company REAL,
            # days_in_waiting_list INTEGER,
            # customer_type TEXT,
            # adr REAL,
            # required_car_parking_spaces INTEGER,
            # total_of_special_requests INTEGER,
            # prediction INTEGER,
            # confidence REAL,
            # timestamp TEXT,
            # actual_status INTEGER,

        # username,
        # data.get("hotel"),
        # data.get("lead_time"),
        # data.get("arrival_date_year"),
        # data.get("arrival_date_month"),
        # data.get("arrival_date_week_number"),
        # data.get("arrival_date_day_of_month"),
        # data.get("stays_in_weekend_nights"),
        # data.get("stays_in_week_nights"),
        # data.get("adults"),
        # data.get("children"),
        # data.get("babies"),
        # data.get("meal"),
        # data.get("country"),
        # data.get("market_segment"),
        # data.get("distribution_channel"),
        # data.get("is_repeated_guest"),
        # data.get("previous_cancellations"),
        # data.get("previous_bookings_not_canceled"),
        # data.get("reserved_room_type"),
        # data.get("assigned_room_type"),
        # data.get("booking_changes"),
        # data.get("deposit_type"),
        # data.get("agent"),
        # data.get("company"),
        # data.get("days_in_waiting_list"),
        # data.get("customer_type"),
        # data.get("adr"),
        # data.get("required_car_parking_spaces"),
        # data.get("total_of_special_requests"),
        # prediction,
        # confidence,
        # timestamp,
        # actual_status
