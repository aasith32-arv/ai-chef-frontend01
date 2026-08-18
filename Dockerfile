FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install deps and build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

# Install production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built assets and public
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/next.config.ts ./next.config.ts

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]
