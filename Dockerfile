FROM node:8.11.2-alpine

WORKDIR /app

ADD . /app

RUN npm install  \
&& npm run all

EXPOSE 8080

CMD ["npm", "start"]