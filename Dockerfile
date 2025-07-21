FROM node:18-alpine

# Install essential build tools
RUN apk add --no-cache openssl python3 make g++

WORKDIR /usr/src/app

# Copy dependency files
COPY package*.json ./
COPY prisma ./prisma/

# Install ONLY production dependencies
RUN npm install --omit=dev
RUN npm install -g pm2

# Generate Prisma client
RUN npx prisma generate

# Copy app files
COPY . .

# Build TypeScript
RUN npm run build

# Health check endpoint (required for Render)
HEALTHCHECK --interval=30s --timeout=10s \
  CMD curl -f http://localhost:4000/api/health || exit 1

# Start with PM2 cluster mode (max uptime)
CMD ["pm2-runtime", "start", "dist/index.js", "--name", "api", "--no-daemon", "--instances", "max"]
