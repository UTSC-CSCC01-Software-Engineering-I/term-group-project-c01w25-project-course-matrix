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
RUN echo "VITE_SERVER_URL = http://localhost:8081" >> .env && \
    echo "VITE_PUBLIC_ASSISTANT_BASE_URL=https://proj-0typqkqr9yfy.assistant-api.com" >> .env && \
    echo "VITE_ASSISTANT_UI_KEY=sk_aui_proj_0typqkqr9yfy_04uORbQgEBNadpc0LmfPzMXxNLVJG0WL" >> .env

# Expose the backend port
EXPOSE 8081

# Start the application
CMD ["npm", "run", "dev"]