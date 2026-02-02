FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create directory for auth
RUN mkdir -p /app/auth_info

# Expose health check port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Run the bot
CMD ["node", "index.js"]
