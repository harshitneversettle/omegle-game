FROM node:20-alpine
WORKDIR /app

COPY ./package.json ./package.json 
COPY ./package-lock.json ./package-lock.json 

RUN npm install --include=dev

COPY . .
EXPOSE 8080

RUN adduser -S app
USER app

CMD ["npm", "run" , "start"]