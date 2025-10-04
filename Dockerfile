FROM node:18

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build TS -> JS
RUN npm run build

# Start server
CMD ["node", "dist/server.js"]
