FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copy app source
COPY . .

# Expose port
EXPOSE 3000

# Default command
CMD [ "node", "app.js" ]
