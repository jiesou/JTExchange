FROM node:20-alpine

WORKDIR /app

# Copy package.json and yarn.lock before installing dependencies
COPY package.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 3000

# Start the application with a script that installs dependencies if needed
CMD ["sh", "-c", "yarn install && yarn start"]
