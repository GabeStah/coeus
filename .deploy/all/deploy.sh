#!/bin/sh

# Restart app
ssh -o StrictHostKeyChecking=no "${REMOTE_USER}@${DEPLOY_ENDPOINT}" << EOF
  cd ${TARGET_DIRECTORY}
  echo "Stopping all pm2 daemons."
  pm2 del all
  echo "Starting app with cloudwatch."
  pm2 start "NODE_ENV=${CI_ENVIRONMENT_NAME} node dist/server.js | ./node_modules/.bin/pino-cloudwatch --group coeus --stream coeus/base/${CI_ENVIRONMENT_NAME}/log --aws_region us-west-2 --aws_access_key_id ${AWS_ACCESS_KEY_ID} --aws_secret_access_key ${AWS_SECRET_ACCESS_KEY}"
  echo "Restarting Nginx"
  sudo systemctl restart nginx
EOF
