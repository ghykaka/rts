FROM node:20-alpine

WORKDIR /app

COPY admin-api/package*.json ./
RUN npm install

COPY admin-api/index.js ./

EXPOSE 3000

CMD ["node", "index.js"]
