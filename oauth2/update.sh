#!/bin/bash
source $HOME/.nvm/nvm.sh
cd $HOME/oauth-server
git pull origin master || {
  echo "git pull failed"
  exit 1
}
npm install
#npm run-script build
npm run pm2-build
#pm2 --no-color restart os
#npm run-script reload
npm run pm2-reload
echo "////// update OAuth-Server on ${HOSTNAME} done //////"
