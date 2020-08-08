FROM node:14
COPY ./package.json /package.json
COPY ./package-lock.json /package-lock.json
RUN npm i
COPY . .
EXPOSE 4000
ENTRYPOINT [ "node", "index.js" ]