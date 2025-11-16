# Multi-stage Dockerfile for Kintsugi AI Platform
# Stage 1: Build Go backend
FROM golang:1.23.0-alpine AS backend-builder

WORKDIR /build

# Copy go mod files
COPY backend/go.mod backend/go.sum ./

# Set GOTOOLCHAIN to prevent auto-upgrades
ENV GOTOOLCHAIN=local

RUN go mod download

# Copy backend source
COPY backend/cmd/ ./cmd/
COPY backend/internal/ ./internal/

# Build backend
RUN CGO_ENABLED=0 GOOS=linux go build -o kintsugi-backend ./cmd/main.go

# Stage 2: Final image with backend + static frontend
FROM alpine:latest

WORKDIR /app

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Copy backend binary
COPY --from=backend-builder /build/kintsugi-backend ./

# Copy static frontend files
COPY public/ ./public/

# Expose port
EXPOSE 8080

# Run backend (which serves static files from /public)
CMD ["./kintsugi-backend"]
