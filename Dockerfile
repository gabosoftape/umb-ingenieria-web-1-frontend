# Utiliza una imagen base de Node.js
FROM node:18.20.0

# Establece el directorio de trabajo en la carpeta de la aplicación
WORKDIR /umb-admin

# Borramos node_modules y package-lock.json antes de copiar el código
RUN rm -rf node_modules package-lock.json

# Copia el archivo package.json y package-lock.json primero para aprovechar la caché de Docker
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install --force

COPY .env .

# Copia todos los archivos del proyecto al directorio de trabajo
COPY . .

# Expon el puerto 3000 en el contenedor
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "run", "dev"]