#!/bin/sh

# Restart app
ssh -o StrictHostKeyChecking=no "${REMOTE_USER}@${DEPLOY_ENDPOINT}" << EOF
  pm2 start "cd ${TARGET_DIRECTORY} && yarn run start:${CI_ENVIRONMENT_NAME}"
  sudo systemctl restart nginx
EOF
