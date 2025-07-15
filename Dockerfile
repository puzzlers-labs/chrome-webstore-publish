# This Dockerfile sets up a Node.js 22 environment with Chromium and pnpm on Alpine Linux.
# It installs pnpm, configures its store, installs production dependencies, copies the app source,
# sets up permissions, switches to an unprivileged user, and defines the start command.
FROM timbru31/node-chrome:22-alpine

# Switches to the root user to install pnpm and other configurations
USER root

# Installs pnpm globally for package management
RUN npm install -g pnpm
# Configures pnpm to use a writable store directory
RUN pnpm config set store-dir /opt/.pnpm-store
# Creates the pnpm store directory
RUN mkdir -p /opt/.pnpm-store
# Sets ownership of the pnpm store to the node user
RUN chown -R node:node /opt/.pnpm-store

RUN mkdir -p /tmp/crashes && chmod 777 /tmp/crashes

WORKDIR /app

# Copies dependency lock files for better Docker layer caching
COPY package.json pnpm-lock.yaml* ./
# Installs only production dependencies using the lock file
RUN pnpm install --prod --frozen-lockfile

# Copies the application source code into the image
COPY . .
# Ensures the app directory is owned by the node user
RUN chown -R node:node /app

# Switches to the unprivileged user
USER node

ENV XDG_CONFIG_HOME=/tmp/.chromium
ENV XDG_CACHE_HOME=/tmp/.chromium

# Sets the PATH environment variable to include the local bin directory.
ENV PATH="/usr/local/bin:${PATH}"

# Defines the default command to run when the container starts.
# Runs the application using node src/index.js on /app.
CMD ["node", "/app/src/index.js"]
