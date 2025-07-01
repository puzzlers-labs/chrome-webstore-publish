# This Dockerfile creates a container with Node.js, Google Chrome, and pnpm, ready to run and deploy the app.

FROM node:22-slim

# Update the package list to get the latest versions
RUN apt-get update

# Install tools needed to download and verify Chrome
RUN apt-get install -y wget gnupg --no-install-recommends

# Download and add the Google Chrome signing key
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -

# Add the Google Chrome repository to the system
RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list'

# Update the package list again to include Chrome's repository
RUN apt-get update

# Install the stable version of Google Chrome
RUN apt-get install -y google-chrome-stable --no-install-recommends

# Remove cached files to keep the image size small
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install pnpm globally for package management
RUN npm install -g pnpm

# Set the working directory for the app
WORKDIR /app

# Copy all files from the current directory to the container
COPY . .

# Install only production dependencies to reduce image size
RUN pnpm install --prod