# syntax=docker/dockerfile:1
# Stage 1: Build stage (optional if we had assets)
FROM nginx:alpine AS prod

# Copy static files
COPY . /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
