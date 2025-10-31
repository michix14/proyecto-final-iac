FROM node:18-alpine
WORKDIR /app

RUN mkdir -p /app/data
COPY package.json ./
RUN npm install --production
COPY . .
# Volumen persistente para datos
#VOLUME ["/app/data"]
EXPOSE 3000
CMD ["npm", "start"]
