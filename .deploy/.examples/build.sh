#!/bin/sh

# Update repo to build-flag, pull, install, and build app
ssh -o StrictHostKeyChecking=no "${REMOTE_USER}@${DEPLOY_ENDPOINT}" << EOF
  cd ${TARGET_DIRECTORY}
  echo "Setting remote origin to '${REPOSITORY_URL}'."
  git remote set-url origin ${REPOSITORY_URL}
  git stash
  echo "Pulling origin '${CI_COMMIT_REF_NAME}'."
  git pull origin ${CI_COMMIT_REF_NAME}
  echo "Checking out '${CI_COMMIT_REF_NAME}'."
  git checkout ${CI_COMMIT_REF_NAME}
  yarn install
  node_modules/.bin/gatsby build --prefix-paths
EOF
