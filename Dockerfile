FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the SvelteKit app
RUN npm run build

# Expose the port (SquareCloud uses 80 or 3000 usually)
EXPOSE 3000

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "build/index.js"]
