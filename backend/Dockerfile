FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

ENV NODE_ENV=production
ENV APP_VERSION=1.0.0

EXPOSE 3000
CMD ["npm", "start"]
