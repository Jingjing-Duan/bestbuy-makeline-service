FROM node:20-alpine

# 工作目录
WORKDIR /app

# 先复制 package 文件（利用缓存）
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制代码
COPY . .

# 暴露端口
EXPOSE 3003

# 启动服务
CMD ["npm", "start"]