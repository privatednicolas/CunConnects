#!/bin/sh
PORT=${PORT:-8090}
exec /pb/pocketbase serve \
  --http=0.0.0.0:${PORT} \
  --dir=/pb/pb_data \
  --migrationsDir=/pb/pb_migrations