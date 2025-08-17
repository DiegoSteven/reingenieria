# Dockerfile para backend Node.js
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Crear directorios necesarios
RUN mkdir -p tmp logo facturas && \
    chmod 777 tmp logo facturas

EXPOSE 3001

CMD ["node", "src/server.js"]
