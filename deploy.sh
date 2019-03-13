#!/bin/sh

npm run build
scp -r ./dist djwood@DO-kmtracker2:/var/www/html/kmtracker
scp -r ./api/classes djwood@DO-kmtracker2:/var/www/html/kmtracker/api
scp -r ./api/public djwood@DO-kmtracker2:/var/www/html/kmtracker/api
scp -r ./api/src djwood@DO-kmtracker2:/var/www/html/kmtracker/api
scp ./api/composer.json djwood@DO-kmtracker2:/var/www/html/kmtracker/api
ssh djwood@DO-kmtracker2 'cd /var/www/html/kmtracker/api; composer install'