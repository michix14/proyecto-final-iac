FROM node:18-alpine

# --- INICIO DE LA SOLUCIÓN ---

# 1. Cambiar a usuario 'root' temporalmente para crear carpetas y dar permisos
USER root

# 2. Establecer el directorio de trabajo. 
# Si no existe, 'root' lo creará.
WORKDIR /app

# 3. Crear el directorio de datos Y ASIGNARLO al usuario 'node'
RUN mkdir -p /app/data && chown -R node:node /app/data

# 4. Copiar package.json y asignarlo a 'node'
COPY --chown=node:node package*.json ./

# 5. Instalar dependencias. 
# 'npm install' crea 'node_modules', así que lo corremos como 'node'
# para que los permisos sean correctos.
USER node
RUN npm install --production

# 6. Copiar el resto del código de la aplicación como 'node'
COPY --chown=node:node . .

# --- FIN DE LA SOLUCIÓN ---

# Volumen persistente para datos (buena práctica descomentarlo)
#VOLUME ["/app/data"]

EXPOSE 3000

# El CMD ya se ejecuta como 'node' (definido en el paso 5)
CMD ["npm", "start"]
