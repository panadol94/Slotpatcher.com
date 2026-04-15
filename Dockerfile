# Nginx static server for SQUEEN668 Scanner
FROM nginx:alpine

# Copy all files to nginx public html directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
