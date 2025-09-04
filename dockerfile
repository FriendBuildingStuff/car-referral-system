# Use an official Node.js image
FROM node:19.5.0-alpine AS base

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build

# Expose the port (optional, based on your app)
EXPOSE 3000

# Command to run the application (optional, based on your app)
CMD ["npm", "start"]
