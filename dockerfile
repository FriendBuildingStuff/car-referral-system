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

# Accept build arguments
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY

# Set environment variables from build arguments
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY




# Set environment variable to disable ESLint during build
ENV DISABLE_ESLINT=true

# Build the app
RUN npm run build

# Expose the port (optional, based on your app)
EXPOSE 3000

# Command to run the application (optional, based on your app)
CMD ["npm", "start"]
