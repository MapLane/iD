FROM node:8.11.2-alpine

WORKDIR /app

COPY . /app

RUN npm install \
&&  npm run all

EXPOSE 8080

ENV NAME world

CMD ["npm", "start"]
