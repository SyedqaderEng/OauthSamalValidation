FROM node:18-alpine

WORKDIR /app

# Install OpenSSL for certificate generation
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create certificates directory
RUN mkdir -p /app/certificates

# Expose port
EXPOSE 3001

# Start command
CMD ["npm", "run", "dev"]
