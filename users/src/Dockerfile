FROM node
EXPOSE 3001

WORKDIR /users/src

COPY controllers /users/src/controllers
COPY models /users/src/models
COPY index.js /users/src/

RUN npm init --yes
RUN npm install express morgan mysql mysql2 axios

CMD node index.js