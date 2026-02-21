# Multi-stage build for Song Lyrics App

# Stage 1: Build React frontend
FROM node:20-alpine AS build

# Set working directory for client
WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm ci --legacy-peer-deps

# Copy client source code
COPY client/ ./

# Build the React app
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine

# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Create app directory
WORKDIR /app

# Copy server package files
COPY package*.json ./

# Install only production dependencies for server (will compile native modules)
RUN npm ci --only=production

# Copy server source code
COPY server.js ./

# Copy routes and config directories
COPY routes/ ./routes/
COPY config/ ./config/

# Copy built React app from build stage
COPY --from=build /app/client/dist ./client/dist

# Create data directory for SQLite database
RUN mkdir -p /data

# Expose port 8080 (Fly.io default)
EXPOSE 8080

# Set environment variable for port
ENV PORT=8080

# Start the application
CMD ["node", "server.js"]