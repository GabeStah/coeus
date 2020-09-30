#!/bin/sh

ssh -o StrictHostKeyChecking=no "${REMOTE_USER}@${DEPLOY_ENDPOINT}" << EOF
  cd ${TARGET_DIRECTORY}
  yarn run test:${CI_ENVIRONMENT_NAME}
EOF
