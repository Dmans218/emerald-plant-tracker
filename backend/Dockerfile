FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN mkdir -p data uploads

ENV PORT=420
EXPOSE 420

CMD ["node", "server.js"]
