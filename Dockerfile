# Multi-stage Dockerfile for Railway - builds both backend and frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /build

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci --production=false

# Copy frontend source
COPY frontend/ ./

# Build Next.js static export
RUN npm run build

# Backend builder stage
FROM golang:1.21-alpine AS backend-builder

WORKDIR /build

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Copy go mod files
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copy backend source
COPY backend/ ./

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o /app/main \
    ./cmd/main.go

# Final stage - minimal runtime image
FROM alpine:latest

# Install runtime dependencies
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy backend binary from builder
COPY --from=backend-builder /app/main ./main

# Copy frontend static files from builder
COPY --from=frontend-builder /build/out ./static

# Expose port
EXPOSE 8080

# Run the application
CMD ["./main"]
