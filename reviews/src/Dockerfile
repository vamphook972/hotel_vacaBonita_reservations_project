FROM node
EXPOSE 3004

WORKDIR /reviews/src

COPY controllers /reviews/src/controllers
COPY models /reviews/src/models
COPY index.js /reviews/src/

RUN npm init --yes
RUN npm install express morgan mysql mysql2 axios

CMD node index.js