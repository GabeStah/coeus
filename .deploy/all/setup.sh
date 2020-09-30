#!/bin/sh

# Setup env
ssh -o StrictHostKeyChecking=no "${REMOTE_USER}@${DEPLOY_ENDPOINT}" << EOF
  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
  sudo apt update
  sudo apt -y install yarn
EOF
