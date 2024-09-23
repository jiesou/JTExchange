# Stage 1 - Build the dist folder
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

# Copy the rest of the application
COPY . .

RUN yarn build

# Stage 2 - Nginx Server
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy the built files from the previous stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80
