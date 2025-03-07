# Stage 1: Build stage - Cài dependencies đầy đủ
FROM node:18-slim AS builder

# Cài đặt các thư viện cần thiết để build bcrypt
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json trước để tối ưu cache layer
COPY package*.json ./

# Cài đặt dependencies đầy đủ
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Rebuild bcrypt và dọn dẹp cache npm
RUN npm rebuild bcrypt --build-from-source && npm cache clean --force

# Stage 2: Production stage - Chỉ giữ lại mã nguồn và dependencies cần thiết
FROM node:18-slim

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy dependencies và mã nguồn từ builder stage
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/package.json package.json

# Mở cổng 3001
EXPOSE 3001

# Chạy ứng dụng
CMD ["npm", "start"]
