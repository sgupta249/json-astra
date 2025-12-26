# Step 1: Use an optimized Nginx image as the base
FROM nginx:alpine

# Step 2: Set the working directory to the default Nginx html folder
WORKDIR /usr/share/nginx/html

# Step 3: Remove default static files provided by Nginx
RUN rm -rf ./*

# Step 4: Copy your local project files into the container
COPY . .

# Step 5: Expose port 8000 to the outside world
EXPOSE 8000

# Step 6: Start Nginx (This is already the default for the image)
CMD ["nginx", "-g", "daemon off;"]
