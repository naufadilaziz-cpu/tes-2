# Multi-stage Dockerfile for Texas Hold'em Online Game
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package definitions
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Build client
WORKDIR /app/client
RUN npm install
COPY client/ ./
RUN npm run build

# Build server
WORKDIR /app/server
RUN npm install
COPY server/ ./
RUN npm run build

# Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3050

# Copy root and server dependencies
COPY package*.json ./
COPY server/package*.json ./server/

WORKDIR /app/server
RUN npm install --omit=dev

WORKDIR /app

# Copy compiled artifacts from builder stage
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/dist ./server/dist

EXPOSE 3050

CMD ["node", "server/dist/index.js"]

