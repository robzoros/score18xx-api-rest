#!/usr/bin/env bash
DB_NAME=$(curl "http://metadata.google.internal/computeMetadata/v1/instance/attributes/DB_NAME" -H "Metadata-Flavor: Google")
DB_USER=$(curl "http://metadata.google.internal/computeMetadata/v1/instance/attributes/DB_USER" -H "Metadata-Flavor: Google")
DB_PASS=$(curl "http://metadata.google.internal/computeMetadata/v1/instance/attributes/DB_PASS" -H "Metadata-Flavor: Google")
DB_URL=$(curl "http://metadata.google.internal/computeMetadata/v1/instance/attributes/DB_URL" -H "Metadata-Flavor: Google")
SECRET_PS=$(curl "http://metadata.google.internal/computeMetadata/v1/instance/attributes/SECRET_PS" -H "Metadata-Flavor: Google")

#cambiamos de directorio
cd ~/score18xx-api-rest/

#ejecutamos programa
npm start