# Run the container with `docker run -p 3000:3000 -t wallet-ms`.
FROM --platform=linux/amd64 node:20.10.0-alpine

WORKDIR /apps

RUN addgroup --system wallet-ms && \
  adduser --system -G wallet-ms wallet-ms

COPY dist/apps/wallet-ms wallet-ms
COPY node_modules wallet-ms/node_modules
RUN chown -R wallet-ms:wallet-ms .

EXPOSE 3000
CMD [ "node", "wallet-ms/main.js" ]
