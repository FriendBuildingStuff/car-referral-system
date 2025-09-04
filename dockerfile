FROM node:20-alpine AS base

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install the dependencies
RUN npm install

FROM node:20 AS build
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
# Copy the rest of the application code
COPY . .

# Set environment variable to disable ESLint during build
ENV DISABLE_ESLINT=true

# Build the app
RUN npm run build

# Expose the port (optional, based on your app)
EXPOSE 3000

# Command to run the application (optional, based on your app)
CMD ["npm", "start"]
