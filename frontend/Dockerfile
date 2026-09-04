# Etapa 1: compilar la app de React con Vite
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite incrusta las variables VITE_* en el build en este momento, no en
# tiempo de ejecucion -- por eso se pasa como build-arg, no como variable
# de entorno normal del contenedor final.
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Etapa 2: servir los archivos ya compilados con nginx (liviano, para producción)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
