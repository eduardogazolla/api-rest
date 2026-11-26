# Etapa 1: testa e compila o front-end (React + Vite)
FROM node:24-alpine AS front
WORKDIR /front
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm test && npm run build

# Etapa 2: compila o projeto com Maven, já com o front em static/ (mesma origem da API, sem CORS)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
COPY --from=front /front/dist ./src/main/resources/static
RUN mvn -q -DskipTests package

# Etapa 3: imagem final, so com o Java para rodar o .jar
FROM eclipse-temurin:17-jre
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
