# Use Node.js LTS image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy app files
FROM node:18 as base1 
WORKDIR /app
COPY . .
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]