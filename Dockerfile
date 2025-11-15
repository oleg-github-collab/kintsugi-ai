# Multi-stage Dockerfile for Railway - Next.js standalone mode
FROM node:20-alpine AS frontend-builder

WORKDIR /build

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build Next.js in standalone mode
RUN npm run build

# Final stage - run Next.js server
FROM node:20-alpine

WORKDIR /app

# Copy Next.js standalone build
COPY --from=frontend-builder /build/.next/standalone ./
COPY --from=frontend-builder /build/.next/static ./.next/static
COPY --from=frontend-builder /build/public ./public

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Run Next.js server
CMD ["node", "server.js"]
