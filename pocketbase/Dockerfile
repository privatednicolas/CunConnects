FROM alpine:3.19

ARG PB_VERSION=0.22.20

RUN apk add --no-cache unzip ca-certificates wget

# Descargar PocketBase
RUN wget -q https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase_${PB_VERSION}_linux_amd64.zip -d /pb/ \
    && rm pocketbase_${PB_VERSION}_linux_amd64.zip

# Copiar migraciones (se corren automáticamente al iniciar)
COPY pb_migrations /pb/pb_migrations

VOLUME /pb/pb_data
EXPOSE 8090

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data", "--migrationsDir=/pb/pb_migrations"]
