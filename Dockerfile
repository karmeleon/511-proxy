FROM node:22-alpine

WORKDIR /app
COPY package.json package-lock.json tsconfig.json /app/
COPY src/ /app/src/

RUN npm i
RUN npm run build

EXPOSE 42424
ENTRYPOINT ["npm", "run", "start"]
