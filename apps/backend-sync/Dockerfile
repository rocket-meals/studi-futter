FROM node:22-bookworm

# Install cron, basic tools and Docker CLI
RUN apt-get update && apt-get install -y git curl
# Install Docker CLI
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
RUN echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian bookworm stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt-get update && apt-get install -y docker-ce-cli

# Install yarn
RUN corepack enable && corepack prepare yarn@stable --activate

# Set working directory
WORKDIR /rocket-meals

# Copy Yarn configuration and releases first
COPY .yarnrc.yml ./
COPY .yarn .yarn

# Copy package.json files for better Docker layer caching
COPY package.json yarn.lock ./
COPY apps/backend-sync/package.json ./apps/backend-sync/
COPY packages/common/package.json ./packages/common/
COPY packages/common-backend/package.json ./packages/common-backend/

# Install dependencies during build time - focused on backend-sync
RUN yarn workspaces focus backend-sync

# Copy the entire project for building
# The files in "data" are ignored completely except for the directus-sync-data subdirectory
COPY . .

# Copy only the directus-sync-data subdirectory from data folder
COPY data/directus-sync-data ./data/directus-sync-data

# Build/prepare the backend-sync application if needed
# (Currently just copying TypeScript files, but could add build step here)

# Set the working directory to backend-sync
WORKDIR /rocket-meals/apps/backend-sync

# Start the application directly with tsx
CMD ["yarn", "start:docker-push"]
