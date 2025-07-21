# -------- Stage 1: Build --------
FROM node:18-alpine as builder

WORKDIR /usr/src/app

# Required system packages
RUN apk add --no-cache openssl python3 make g++

# Copy files
COPY package*.json tsconfig.json ./
COPY prisma ./prisma/
COPY . .

# Install all dependencies including dev
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build


# -------- Stage 2: Production --------
FROM node:18-alpine

WORKDIR /usr/src/app

# Install PM2 globally
RUN npm install -g pm2

# Copy only necessary files from builder stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma/
COPY --from=builder /usr/src/app/node_modules ./node_modules/
COPY --from=builder /usr/src/app/dist ./dist/

# Expose port
EXPOSE 4000

# Healthcheck (Render support)
HEALTHCHECK --interval=30s --timeout=10s \
  CMD curl -f http://localhost:4000/api/health || exit 1

# Start with PM2
CMD ["pm2-runtime", "start", "dist/index.js", "--name", "api", "--no-daemon", "--instances", "max"]

