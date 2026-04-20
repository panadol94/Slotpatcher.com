# Node static server + trusted icon proxy for Slotpatcher.com
FROM node:20-alpine

WORKDIR /app

# Copy site files and lightweight Node server
COPY . /app

# Expose HTTP port
EXPOSE 80

# Start static server with trusted icon proxy route
CMD ["node", "server.mjs"]
