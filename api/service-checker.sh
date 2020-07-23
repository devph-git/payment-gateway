DB_SERVICE=postgres
DB_HOST=devphio_payment_gateway_db
DB_PORT=5432
for count in {1..12}; do
      echo "Pinging ${DB_SERVICE} attempt "${count}
      if  $(nc -z ${DB_HOST} ${DB_PORT}) ; then
        echo "${DB_SERVICE} detected"
        yarn typeorm:run
        break
      fi
      sleep 5
done

QUEUE_SERVICE=redis
QUEUE_HOST=devphio_payment_gateway_redis
QUEUE_PORT=6379
for count in {1..12}; do
      echo "Pinging ${QUEUE_SERVICE} attempt "${count}
      if  $(nc -z ${QUEUE_HOST} ${QUEUE_PORT}) ; then
        echo "${QUEUE_SERVICE} detected"
        yarn start:dev
        break
      fi
      sleep 5
done