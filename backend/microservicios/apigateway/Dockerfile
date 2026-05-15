# Krakend v2.10.2 - API Gateway declarativo
FROM devopsfaith/krakend:2.10.2

COPY krakend.json /etc/krakend/krakend.json

EXPOSE 8080

# Imagen base ya define el entrypoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:8080/__health || exit 1
