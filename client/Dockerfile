# Stage 1 - Build the dist folder
FROM node:20-alpine as build-stage

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

# Copy the rest of the application
COPY . .

RUN yarn build

# Stage 2 - Nginx Server
FROM nginx:alpine

# Copy the built files from the previous stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf   

EXPOSE 80
