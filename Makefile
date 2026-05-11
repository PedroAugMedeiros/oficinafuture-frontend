# Nome do projeto (opcional)
APP_NAME=my-expo-app

# Paths do JSON Server
DBOS=src/app/services/osData.json
DBPRODUCTS=src/app/services/productsDB.json
DBVEICULOS=src/app/services/vehiclesDB.json
DBPEOPLES=src/app/services/peopleDB.json

BASEOS=src/app/services/RESET/resetOsDB.json
BASEPRODUCTS=src/app/services/RESET/resetProductsDB.json
BASEVEICULOS=src/app/services/RESET/resetVeiculos.json
BASEPEOPLES=src/app/services/RESET/resetPessoas.json

# Comandos base
NPM=npm
NPX=npx


dev:
	npx json-server --watch $(DBOS) --port 3000 && $(NPX) expo start -c --web
# Start do projeto
start:
	$(NPX) expo start -c

# Rodar no Android
android:
	$(NPX) expo start --android


# 🔥 4 JSON SERVERS
server:
	npx json-server --watch $(DBOS) --port 3000 & \
	npx json-server --watch $(DBPRODUCTS) --port 4000 & \
	npx json-server --watch $(DBVEICULOS) --port 5000 & \
	npx json-server --watch $(DBPEOPLES) --port 5001

# 🔥 RESET DO BANCO (NOVO)
resetapi:
	cp $(BASEOS) $(DBOS)
	cp $(BASEPRODUCTS) $(DBPRODUCTS)
	cp $(BASEVEICULOS) $(DBVEICULOS)
	cp $(BASEPEOPLES) $(DBPEOPLES)

# 🔥 RESET + SERVER
dev-server: reset-db
	npx json-server $(DBOS) --port 3000

# Rodar no iOS (apenas Mac)
ios:
	$(NPX) expo start --ios

# Rodar no navegador
web:
	$(NPX) expo start -c --web

# Instalar dependências
install:
	$(NPM) install

# Adicionar nova dependência
add:
	$(NPM) install $(pkg)

# Remover dependência
remove:
	$(NPM) uninstall $(pkg)

# Atualizar dependências
update:
	$(NPM) update

# Limpar cache geral do Expo
clear-cache:
	$(NPX) expo start -c

# Verificar ambiente Expo
doctor:
	$(NPX) expo doctor

# Build (EAS)
build-android:
	$(NPX) expo run:android

build-ios:
	$(NPX) expo run:ios

# Publicar
publish:
	$(NPX) expo publish
