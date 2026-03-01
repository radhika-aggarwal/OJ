FROM node:18-alpine

WORKDIR /app
RUN apk update && apk add --no-cache g++ python3 py3-pip
COPY package*.json ./
RUN npm install --force
COPY . .

CMD ["node", "app.js"]

EXPOSE 3000