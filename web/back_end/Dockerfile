# Sử dụng Python 3.10 mỏng nhẹ
FROM python:3.10-slim

# Thiết lập thư mục làm việc trong container
WORKDIR /main

# Cài đặt các công cụ cần thiết cho hệ thống (nếu có)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy file định nghĩa thư viện vào container
COPY requirements.txt .

# Cài đặt các thư viện Python
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code backend vào container
COPY . .

# Mở cổng 8000 cho FastAPI
EXPOSE 8000

# Chạy ứng dụng FastAPI bằng Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]