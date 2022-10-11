FROM node:16

# arguments
ARG URL=https://www.github.com/ebdonato
ARG PORT=3000
ARG AUTO_HOURS="9 21"

# environment variables
ENV URL=${URL}
ENV PORT=${PORT}
ENV AUTO_HOURS=${AUTO_HOURS}

# We don't need the standalone Chromium
ENV EXECUTABLE_PATH=/usr/bin/google-chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Ref.: https://dev.to/cloudx/how-to-use-puppeteer-inside-a-docker-container-568c
# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install curl gnupg -y \
    && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install google-chrome-stable -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json .
RUN npm ci --only=production --no-optional

# Bundle APP files
COPY index.js .
COPY .env.defaults .

# Bundle app source

EXPOSE ${PORT}

# Show current folder structure in logs
RUN ls -al -R

CMD [ "node", "index.js" ]
