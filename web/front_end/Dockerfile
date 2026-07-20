# ----- STAGE 1: Build React App -----
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ code và tiến hành build
COPY . .
RUN npm run build

# ----- STAGE 2: Serve bằng Nginx -----
FROM nginx:alpine

# Copy kết quả build từ Stage 1 sang thư mục của Nginx
# (Nếu dùng Vite thì đổi "build" thành "dist")
COPY --from=builder /app/build /usr/share/nginx/html

# Mở cổng 80 cho web
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]