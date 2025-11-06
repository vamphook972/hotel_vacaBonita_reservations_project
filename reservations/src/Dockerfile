FROM node
EXPOSE 3003

WORKDIR /reservations

COPY controllers /reservations/src/controllers
COPY models /reservations/src/models
COPY index.js /reservations/src/

RUN npm init --yes
RUN npm install express morgan mysql mysql2 axios

CMD node index.js