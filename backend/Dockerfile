# Use Node.js image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the backend port
EXPOSE ${SERVER_PORT}

# Run the backend server
CMD ["npm", "run", "start"]
