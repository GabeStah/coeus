#!/bin/sh

# Update repo to build-flag, pull, install, and build app
ssh -o StrictHostKeyChecking=no ubuntu@"${DEPLOY_ENDPOINT}" << EOF
  cd ${TARGET_DIRECTORY}
  echo "Setting remote origin to '${REPOSITORY_URL}'."
  git remote set-url origin ${REPOSITORY_URL}
  git stash
  echo "Pulling origin '${CI_COMMIT_REF_NAME}'."
  git pull origin ${CI_COMMIT_REF_NAME}
  echo "Checking out '${CI_COMMIT_REF_NAME}'."
  git checkout ${CI_COMMIT_REF_NAME}
EOF

# Transfer config file
echo "Copying ${CONFIG_FILE} to /config/${CI_ENVIRONMENT_NAME}.json"
scp -o StrictHostKeyChecking=no "${CONFIG_FILE}" "ubuntu@${DEPLOY_ENDPOINT}:${TARGET_DIRECTORY}/config/${CI_ENVIRONMENT_NAME}.json"

# Installing packages and building app.
ssh -o StrictHostKeyChecking=no ubuntu@"${DEPLOY_ENDPOINT}" << EOF
  cd ${TARGET_DIRECTORY}
  echo "Installing node modules."
  yarn install
  echo "Building app."
  yarn run build
EOF
