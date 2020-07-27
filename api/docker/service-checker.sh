#!/bin/bash

DB_SERVICE=postgres
DB_HOST=devphio_payment_gateway_db
DB_PORT=5432
DB_EXECUTE_COMMAND='yarn typeorm:run'

SERVICES=( 'DB' )
RETRIES=12

for i in "${!SERVICES[@]}"; do
  alias=${SERVICES[$i]}
  eval NAME=('${'$alias'_SERVICE}')
  eval HOST=('${'$alias'_HOST}')
  eval PORT=('${'$alias'_PORT}')

  echo $NAME $HOST $PORT

  # Try upto 12 time for 5 seconds = 1 minute
  for count in `seq 1 ${RETRIES}`; do
    echo "Pinging ${NAME} attempt "${count}
    if  $(nc -z ${HOST} ${PORT}) ; then
      echo "${NAME} detected"

      # Execute scripts e.g migrations
      eval '${'$alias'_EXECUTE_COMMAND}'

      break
    fi
    sleep 5
  done
done
