FROM alpine:3.19

ARG PB_VERSION=0.22.20

RUN apk add --no-cache unzip ca-certificates wget

# Descargar PocketBase
RUN wget -q https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_${PB_VERSION}_linux_amd64.zip -d /pb/ \
    && rm pocketbase_${PB_VERSION}_linux_amd64.zip

# Copiar migraciones
COPY pb_migrations /pb/pb_migrations

# Script de inicio que usa $PORT dinámico
COPY start.sh /pb/start.sh
RUN chmod +x /pb/start.sh

VOLUME /pb/pb_data
EXPOSE 8090

CMD ["/pb/start.sh"]