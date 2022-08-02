#!/bin/sh


rm -rf /var/www/html/env.js

ENV_JS="/var/www/html/env.js"
REACT_APP_VARS=$(compgen -e | grep REACT_APP_)

echo "window._env_ = {" >> $ENV_JS
echo " REACT_APP_API_URL: '${REACT_APP_API_URL}'," >> $ENV_JS
echo " PRICING_API_URL: '${PRICING_API_URL}'," >> $ENV_JS
echo " PACKAGING_API_URL: '${PACKAGING_API_URL}'," >> $ENV_JS

#for react_var in $REACT_APP_VARS; do
#    echo " $react_var: '${REACT_APP_API_URL}'," >> $ENV_JS
#done

echo "}" >> $ENV_JS


###health.json
cat << HEALTH_JSON > "/var/www/html/health.json"

{
  "status": "healthy",
  "environment": "$ENV",
  "region": "$REACT_APP_AWS_REGION"
}

HEALTH_JSON



echo "################"
echo "#PRINT ENV VALUE"
echo $ENV


echo "################"
eval$(useradd -ms /bin/bash appuser)
eval $(mkdir -p /etc/httpd/conf/)
eval $(cp /app/httpd-${ENV}.conf /etc/httpd/conf/httpd.conf)
echo "################"
echo "RUN SERVER"
httpd -DFOREGROUND
echo "################"
echo "######## HTTPD FG"
