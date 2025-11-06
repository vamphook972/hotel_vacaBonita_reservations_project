FROM node
EXPOSE 3002

WORKDIR /hotels

COPY controllers /hotels/src/controllers
COPY models /hotels/src/models
COPY index.js /hotels/src/

RUN npm init --yes
RUN npm install express morgan mysql mysql2 axios

CMD node index.js