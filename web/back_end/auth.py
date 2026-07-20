from datetime import datetime, timedelta
from typing import Union
from jose import JWTError, jwt
from passlib.context import CryptContext
import sqlite3

# Các tham số cấu hình mã hóa bảo mật chuẩn OAuth2
SECRET_KEY = "b66565d6b87c75794360d32c305f187282f678b86bf0627968d86f9f42f28f2e"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    """Mã hóa mật khẩu thô thành chuỗi hash bảo mật để lưu vào DB"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    """So khớp mật khẩu người dùng nhập vào với mật khẩu đã mã hóa lưu trong DB"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    """Tạo mã Access Token JWT có thời hạn sử dụng"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_from_db(username: str):
    """Lấy thông tin tài khoản người dùng từ SQLite"""
    conn = sqlite3.connect("hotel_booking.db")
    cursor = conn.cursor()
    cursor.execute("SELECT username, hashed_password FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    if user:
        return {"username": user[0], "hashed_password": user[1]}
    return None

def create_user_in_db(username: str, password_raw: str):
    """Lưu tài khoản người dùng mới vào SQLite sau khi đã mã hóa mật khẩu"""
    conn = sqlite3.connect("hotel_booking.db")
    cursor = conn.cursor()
    hashed_pwd = get_password_hash(password_raw)
    print(hashed_pwd)

    try:
        cursor.execute("INSERT INTO users (username, hashed_password) VALUES (?, ?)", (username, hashed_pwd))
        conn.commit()
        success = True
    except sqlite3.IntegrityError:
        # Lỗi nếu username đã bị trùng
        success = False
    conn.close()
    return success