# Use an official Node.js image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Create the .env file and write environment variables to it
RUN echo "NODE_ENV=development" >> .env && \
    echo "PORT=8081" >> .env && \
    echo "CLIENT_APP_URL=http://localhost:5173" >> .env && \
    echo "DATABASE_URL=https://pmiihreibkvcruwhjvpj.supabase.co" >> .env && \
    echo "DATABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtaWlocmVpYmt2Y3J1d2hqdnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODE3NTMyNiwiZXhwIjoyMDUzNzUxMzI2fQ.hZ1goNXMKMfYDPyihsM5lZTh4i30BcEWMkJ7uJy1ddA" >> .env && \
    echo "OPENAI_API_KEY=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" >> .env && \
    echo "PINECONE_API_KEY=pcsk_49n8ja_Enwi4D5oNZSrebFePJYEK8bPzFs9eRBocjas4YSvPb5pBxD8qPHZPUVBwL4PDYQ" >> .env && \
    echo "PINECONE_INDEX_NAME=course-matrix" >> .env

# Expose the backend port
EXPOSE 8081

# Start the application
CMD ["npm", "run", "dev"]
