FROM node
EXPOSE 3005

WORKDIR /rooms

COPY controllers /rooms/src/controllers
COPY models /rooms/src/models
COPY index.js /rooms

RUN npm init --yes
RUN npm install express morgan mysql mysql2 axios

CMD node index.js