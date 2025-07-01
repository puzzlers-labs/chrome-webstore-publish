# Sets up a Node.js environment with Google Chrome and pnpm installed for running and managing Node.js applications that require Chrome.
# Installs necessary tools, Chrome browser, and pnpm, then prepares the container for production use.

FROM node:22-slim

# Update package list to get the latest versions of packages
RUN apt-get update

# Install essential tools for downloading and installing Chrome
RUN apt-get install -y wget gnupg curl ca-certificates --no-install-recommends

# Download the latest Google Chrome browser to a temporary location
RUN curl -fsSL -o /tmp/google-chrome-stable_current_amd64.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

# Install Google Chrome and fix dependencies if needed
RUN dpkg -i /tmp/google-chrome-stable_current_amd64.deb || apt-get install -fy

# Remove the .deb package after installation to reduce image size
RUN rm /tmp/google-chrome-stable_current_amd64.deb

# Clean up cached files to reduce image size
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install pnpm globally for efficient package management
RUN npm install -g pnpm

# Set the working directory for the application code
WORKDIR /app

# Copy application files into the container
COPY . .

# Install only production dependencies
RUN pnpm install --prod