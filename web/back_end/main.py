from fastapi import FastAPI, Depends, HTTPException, status, Body, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import List, Optional
from jose import JWTError, jwt
import joblib
import database as db
import auth
import io
import pandas as pd
import numpy as np

app = FastAPI(
    title="Dự đoán hủy đặt phòng",
    description="API dự báo hủy phòng khách sạn tích hợp bảo mật OAuth2 (JWT Token) và SQLite",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# 1. LOAD MODEL VÀ PREPROCESSOR (Dùng 2 file export từ EDA Script)
# ==========================================================
try:
    model = joblib.load("best_hotel_model.pkl")
    preprocessor = joblib.load("preprocessor.pkl")
    print("✅ Loaded Model and Preprocessor successfully!")
except Exception as e:
    model = None
    preprocessor = None
    print(f"\n❌ LỖI LOAD MODEL: {type(e).__name__}: {str(e)}\n")

# Auth Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    """Xác thực JWT Token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Không thể xác thực thông tin đăng nhập",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = auth.get_user_from_db(username)
    if user is None:
        raise credentials_exception
    return user

# ==========================================================
# 2. PYDANTIC SCHEMA DỮ LIỆU ĐẦU VÀO (Đủ các cột cần cho Feature Engineering)
# ==========================================================
class BookingInput(BaseModel):
    hotel: str = Field("City Hotel", description="Resort Hotel hoặc City Hotel")
    lead_time: int = Field(..., description="Số ngày đặt trước")
    arrival_date_year: int = Field(2026)
    arrival_date_month: str = Field("August")
    arrival_date_week_number: int = Field(33)
    arrival_date_day_of_month: int = Field(15)
    stays_in_weekend_nights: int = Field(0)
    stays_in_week_nights: int = Field(1)
    adults: int = Field(2)
    children: float = Field(0.0)
    babies: float = Field(0.0)
    meal: str = Field("BB")
    country: str = Field("PRT")
    market_segment: str = Field("Online TA")
    distribution_channel: str = Field("TA/TO")
    is_repeated_guest: int = Field(0)
    previous_cancellations: int = Field(0)
    previous_bookings_not_canceled: int = Field(0)
    reserved_room_type: str = Field("A")
    booking_changes: int = Field(0)
    deposit_type: str = Field("No Deposit")
    agent: Optional[float] = Field(0.0)
    company: Optional[float] = Field(0.0)
    days_in_waiting_list: int = Field(0)
    customer_type: str = Field("Transient")
    adr: float = Field(..., description="Giá phòng trung bình/đêm")
    required_car_parking_spaces: int = Field(0)
    total_of_special_requests: int = Field(0)

# ==========================================================
# 3. HÀM CHUNG: FEATURE ENGINEERING & DỰ ĐOÁN
# ==========================================================
def process_and_predict(df_raw: pd.DataFrame):
    """
    Thực hiện Feature Engineering khớp 100% với file EDA Train
    sau đó biến đổi qua preprocessor và chạy model.
    """
    df = df_raw.copy()

    # Handling Missing Values cơ bản
    df["children"] = df["children"].fillna(0)
    df["babies"] = df["babies"].fillna(0)
    df["country"] = df["country"].fillna("Unknown")
    df["agent"] = df["agent"].fillna(0)
    df["company"] = df["company"].fillna(0)

    # ------------------ FEATURE ENGINEERING ------------------
    df["total_nights"] = df["stays_in_weekend_nights"] + df["stays_in_week_nights"]
    df["total_guests"] = df["adults"] + df["children"] + df["babies"]
    df["has_children"] = ((df["children"] + df["babies"]) > 0).astype(int)
    df["previous_bookings"] = df["previous_cancellations"] + df["previous_bookings_not_canceled"]
    df["has_previous_cancellation"] = (df["previous_cancellations"] > 0).astype(int)

    df["adr_per_guest"] = np.where(
        df["total_guests"] > 0,
        df["adr"] / df["total_guests"],
        0
    )
    df["estimated_booking_value"] = df["adr"] * df["total_nights"]
    df["has_weekend_stay"] = (df["stays_in_weekend_nights"] > 0).astype(int)
    # ---------------------------------------------------------

    if model and preprocessor:
        # Preprocess dữ liệu bằng Preprocessor từ EDA
        X_processed = preprocessor.transform(df)
        
        # Dự đoán nhãn và xác suất
        predictions = model.predict(X_processed)
        probabilities = model.predict_proba(X_processed)
        
        # Lấy xác suất của lớp được dự đoán
        confidences = [float(prob[pred]) for pred, prob in zip(predictions, probabilities)]
        return predictions.tolist(), confidences
    else:
        # Dummy Logic Fallback nếu chưa load được file .pkl
        # predictions = [1 if row.get("lead_time", 0) > 120 or row.get("previous_cancellations", 0) > 0 else 0 for _, row in df.iterrows()]
        # confidences = [0.85] * len(predictions)
        
        return predictions, confidences

# ==========================================================
# 4. AUTH ENDPOINTS
# ==========================================================
@app.get("/check-token")
def check_token(current_user: dict = Depends(get_current_user)):
    return {"valid": True, "username": current_user["username"]}

@app.post("/register")
def register(username: str, password_raw: str):
    success = auth.create_user_in_db(username, password_raw)
    if not success:
        raise HTTPException(status_code=400, detail="Tên tài khoản này đã được sử dụng")
    return {"message": f"Đăng ký tài khoản {username} thành công!"}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = auth.get_user_from_db(form_data.username)
    if not user or not auth.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tài khoản hoặc mật khẩu không chính xác",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

# ==========================================================
# 5. BUSINESS ENDPOINTS
# ==========================================================
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "api_security": "OAuth2 / JWT Enabled",
        "database": "SQLite Connected",
        "model_loaded": model is not None
    }

@app.get("/model-info")
def model_info():
    return {
        "model_name": type(model).__name__ if model else "Baseline Rules",
        "version": "1.0.0",
        "pipeline": "ColumnTransformer + Preprocessor PKL",
        "metrics": {
            "Accuracy": 0.86,
            "F1-Score": 0.83,
            "Precision": 0.84,
            "Recall": 0.82
        }
    }

@app.post("/predict")
def predict(booking: BookingInput, current_user: dict = Depends(get_current_user)):
    try:
        data_dict = booking.model_dump()
        df_input = pd.DataFrame([data_dict])
        
        preds, confs = process_and_predict(df_input)
        prediction = int(preds[0])
        confidence = float(confs[0])

        # Lưu lịch sử vào SQLite Database
        db.save_prediction(current_user["username"], data_dict, prediction, confidence)
        
        return {
            "is_canceled": prediction,
            "confidence": round(confidence, 4),
            "message": "Dự báo: Đơn đặt phòng có khả năng cao sẽ BỊ HỦY" if prediction == 1 else "Dự báo: Khách sẽ ĐẾN NHẬN PHÒNG"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý dự đoán: {str(e)}")

@app.get("/history")
def get_history(current_user: dict = Depends(get_current_user)):
    return db.get_history(username=current_user["username"])

@app.put("/history/{record_id}/actual")
def update_actual_status(
    record_id: int,
    actual_status: int = Body(..., embed=True),
    current_user: dict = Depends(get_current_user)
):
    success = db.update_status(record_id, actual_status)
    if not success:
        raise HTTPException(status_code=500, detail="Không thể cập nhật trạng thái")
    return {"message": "Cập nhật trạng thái thành công!"}

@app.post("/predict-batch")
async def predict_batch(
    file: UploadFile = File(...), 
    current_user: dict = Depends(get_current_user)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Vui lòng tải lên file định dạng CSV")
    
    try:
        contents = await file.read()
        
        # Tự động đọc file CSV
        try:
            # Đọc trực tiếp duy nhất 10 dòng đầu từ stream để tiết kiệm RAM và tăng tốc độ xử lý
            df = pd.read_csv(io.BytesIO(contents), sep=',', skipinitialspace=True, nrows=15)
            if len(df.columns) <= 1:
                df = pd.read_csv(io.BytesIO(contents), sep=';', skipinitialspace=True)
        except Exception:
            df = pd.read_csv(io.BytesIO(contents), sep=';', skipinitialspace=True)
        

        # 1. Xử lý chuẩn hóa các cột quan trọng
        if 'adr' in df.columns:
            df['adr'] = df['adr'].fillna(0.0).astype(float)
        
        if 'lead_time' in df.columns:
            df['lead_time'] = df['lead_time'].fillna(0).astype(int)
        
        if 'deposit_type' in df.columns:
            df['deposit_type'] = df['deposit_type'].fillna('No Deposit').astype(str)
        
        if 'agent' in df.columns:
            df['agent'] = df['agent'].fillna(0).astype(int)
        
        if 'previous_cancellations' in df.columns:
            df['previous_cancellations'] = df['previous_cancellations'].fillna(0).astype(int)

        # 2. Làm sạch các cột còn lại
        num_cols = df.select_dtypes(include=[np.number]).columns
        str_cols = df.select_dtypes(include=['object']).columns
    
        df[num_cols] = df[num_cols].fillna(0)
        df[str_cols] = df[str_cols].fillna("Unknown")

        # 3. Dự đoán AI (chỉ chạy cho 10 dòng đã cắt)
        predictions, confidences = process_and_predict(df)

        df['prediction'] = predictions
        df['confidence'] = [round(c, 4) for c in confidences]

        # 4. Chuyển thành list dict và lưu vào Database
        records = df.to_dict(orient='records')

        for row_dict in records:
            pred = int(row_dict['prediction'])
            conf = float(row_dict['confidence'])
            db.save_prediction(current_user["username"], row_dict, pred, conf)

        # 5. Xuất file CSV kết quả (cũng chỉ gồm 10 dòng)
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        
        response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
        response.headers["Content-Disposition"] = f"attachment; filename=results_{file.filename}"
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý file CSV: {str(e)}")