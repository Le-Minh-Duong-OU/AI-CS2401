import sqlite3
import pandas as pd
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, "hotel_booking.db")

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # 1. Tạo bảng người dùng (OAuth2)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            hashed_password TEXT
        )
    ''')
    
    # 2. Tạo bảng lịch sử dự đoán
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS prediction_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,           
            adr REAL,
            lead_time INTEGER,
            agent REAL,
            previous_cancellations INTEGER,
            deposit_type TEXT,
            prediction INTEGER,
            confidence REAL,
            timestamp TEXT,
            actual_status INTEGER
        )
    ''')
    conn.commit()
    conn.close()

def save_prediction(username: str, data: dict, prediction: int, confidence: float):
    """Lưu dữ liệu dự đoán vào CSDL"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    actual_status = -1
    
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
    """Lấy danh sách lịch sử dự đoán"""
    conn = sqlite3.connect(DB_NAME)
    if username:
        df = pd.read_sql_query("SELECT * FROM prediction_history WHERE username = ? ORDER BY id DESC", conn, params=(username,))
    else:
        df = pd.read_sql_query("SELECT * FROM prediction_history ORDER BY id DESC", conn)
    conn.close()
    return df.to_dict(orient="records")

def update_status(record_id: int, actual_status: int):
    """Cập nhật trạng thái thực tế của đơn hàng"""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    try:
        cursor.execute(
            '''UPDATE prediction_history SET actual_status = ? WHERE id = ?''',
            (actual_status, record_id)
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"Lỗi cập nhật db: {e}")
        return False
    finally:
        conn.close()

# Tự động khởi tạo bảng khi import module
init_db()