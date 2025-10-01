FROM node:20.10.0-alpine AS builder1
WORKDIR /src
COPY . .
RUN npm add --global nx
RUN npm install --legacy-peer-deps
ENV FORCE_COLOR=0
ENV NODE_DISABLE_COLORS=1
RUN nx build wallet-ms

FROM builder1 AS builder2

WORKDIR /apps

RUN addgroup --system wallet-ms && \
  adduser --system -G wallet-ms wallet-ms

COPY --from=builder1 /src/dist/apps/wallet-ms wallet-ms
COPY --from=builder1 /src/node_modules wallet-ms/node_modules
RUN chown -R wallet-ms:wallet-ms .

EXPOSE 3000
CMD [ "node", "wallet-ms/main.js" ]
