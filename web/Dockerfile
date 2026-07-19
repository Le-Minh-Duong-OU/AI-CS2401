# 1. Sử dụng Python bản chính thức, nhẹ và ổn định
FROM python:3.10-slim

# 2. Đặt thư mục làm việc bên trong container
WORKDIR /app

# 3. Copy file danh sách thư viện vào trước để tận dụng cache của Docker
COPY requirements.txt .

# 4. Cài đặt các thư viện (cần cài thêm bcrypt độc lập để tránh lỗi passlib trước đó)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir "bcrypt==4.0.1" passlib && \
    pip install --no-cache-dir -r requirements.txt

# 5. Copy toàn bộ code từ thư mục back_end và data ngoài máy thật vào container
COPY back_end/ ./back_end/
COPY data/ ./data/

# 6. Mở cổng 8000 của container ra ngoài
EXPOSE 8000

# 7. Lệnh chạy ứng dụng khi container khởi động
# Ta chạy uvicorn từ thư mục làm việc, chỉ định module main bên trong thư mục back_end
CMD ["uvicorn", "back_end.main:app", "--host", "0.0.0.0", "--port", "8000"]