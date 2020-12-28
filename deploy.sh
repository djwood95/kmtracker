#!/bin/sh

npm run build
scp -r ./dist djwood@kmtracker:/var/www/html/kmtracker
scp -r ./api/classes djwood@kmtracker:/var/www/html/kmtracker/api
scp -r ./api/public djwood@kmtracker:/var/www/html/kmtracker/api
scp -r ./api/src djwood@kmtracker:/var/www/html/kmtracker/api
scp ./api/composer.json djwood@kmtracker:/var/www/html/kmtracker/api
ssh djwood@kmtracker 'cd /var/www/html/kmtracker/api; composer install'