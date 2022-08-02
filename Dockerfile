FROM centos/httpd

ENV APP_DIR /app
WORKDIR /var/www/html

RUN yum -y install mod_ssl openssh
COPY  /dist/ /var/www/html
COPY .env /var/www/html/.env
COPY health.json /var/www/html/health.json
COPY /startup.sh /app/bin/startup.sh
COPY /httpd-*.conf /app/
RUN chmod +x /app/bin/startup.sh
RUN chmod -R 755 /var/www/html
CMD /bin/sh -c /app/bin/startup.sh
