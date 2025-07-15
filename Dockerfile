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
# Sets ownership of the pnpm store to the root user
# RUN chown -R root:root /opt/.pnpm-store

# Creates the crashes and chromium database directories in /tmp.
RUN mkdir -p /tmp/crashes && chmod 777 /tmp/crashes
RUN mkdir -p /tmp/.chromium && chmod 777 /tmp/.chromium
RUN mkdir -p /github/workspace/chrome-webstore-publish-artifacts && chmod 666 /github/workspace/chrome-webstore-publish-artifacts

WORKDIR /app

# Copies dependency lock files for better Docker layer caching
COPY package.json pnpm-lock.yaml* ./
# Installs only production dependencies using the lock file
RUN pnpm install --prod --frozen-lockfile

# Copies the application source code into the image
COPY . .
# Ensures the app directory is owned by the root user
# RUN chown -R root:root /app

# Sets the XDG_CONFIG_HOME and XDG_CACHE_HOME environment variables to /tmp/.chromium.
# These directories and environment variables are needed for Chromium to work.
ENV XDG_CONFIG_HOME=/tmp/.chromium
ENV XDG_CACHE_HOME=/tmp/.chromium

# Sets the PATH environment variable to include the local bin directory.
ENV PATH="/usr/local/bin:${PATH}"

# Defines the default command to run when the container starts.
# Runs the application using node src/index.js on /app.
CMD ["node", "/app/src/index.js"]
