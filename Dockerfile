FROM node:20-alpine

WORKDIR /app

# Instala bash, útil para uso no Alpine
RUN apk add --no-cache bash

# Copia arquivos de dependência
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código do projeto
COPY . .

# Expõe a porta padrão do Expo
EXPOSE 8081

# Inicia o Expo limpando o cache
CMD ["npx", "expo", "start", "-c"]
