# Minimal image worker container for image variant generation
FROM node:20-alpine
WORKDIR /app

# Install dependencies (include dev for ts tooling)
COPY package*.json ./
RUN npm ci

# Copy required source
COPY prisma ./prisma
COPY lib ./lib
COPY scripts/imageWorker.ts ./scripts/imageWorker.ts

# Generate Prisma client for runtime
RUN npx prisma generate

# Run the TypeScript worker via ts-node (npx will fetch on first run)
CMD ["npx", "ts-node", "scripts/imageWorker.ts"]
