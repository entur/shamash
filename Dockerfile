FROM node:14.16.1-alpine3.10

RUN addgroup appuser && adduser --disabled-password --gecos '' appuser --ingroup appuser

EXPOSE 8000
ENV port 8000

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY --chown=appuser:appuser . .
USER appuser

CMD [ "yarn", "run", "start:server" ]
