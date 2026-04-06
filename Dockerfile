FROM node:20-alpine

WORKDIR /app

# 复制后端代码
COPY admin-api/package*.json ./
RUN npm install
COPY admin-api/index.js ./

# 复制前端构建文件
COPY admin/dist ./dist

EXPOSE 3000

CMD ["node", "index.js"]
