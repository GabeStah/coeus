#!/bin/sh

# Compress src directory
echo "Compressing ${ARCHIVE_FILENAME}"
tar -zcf "${ARCHIVE_FILENAME}" .

# Create target directory
ssh -o StrictHostKeyChecking=no "${REMOTE_USER}@${DEPLOY_ENDPOINT}" << EOF
  echo "Creating target directory: ${TARGET_DIRECTORY}"
  mkdir -p ${TARGET_DIRECTORY}
  cd ${TARGET_DIRECTORY}
  mkdir -p config
EOF

# Transfer archive
echo "Transferring ${ARCHIVE_FILENAME}"
scp -o StrictHostKeyChecking=no "${ARCHIVE_FILENAME}" "${REMOTE_USER}@${DEPLOY_ENDPOINT}:${TARGET_DIRECTORY}"

# Extract archive
ssh -o StrictHostKeyChecking=no "${REMOTE_USER}"@"${DEPLOY_ENDPOINT}" << EOF
  cd ${TARGET_DIRECTORY}
  echo "Extracting ${ARCHIVE_FILENAME} to remote"
  tar -zxf ${ARCHIVE_FILENAME}
  echo "Removing ${ARCHIVE_FILENAME} from remote"
  rm ${ARCHIVE_FILENAME}
EOF

# Transfer config file
echo "Copying ${CONFIG_FILE} to /config/${CI_ENVIRONMENT_NAME}.json"
scp -o StrictHostKeyChecking=no "${CONFIG_FILE}" "${REMOTE_USER}@${DEPLOY_ENDPOINT}:${TARGET_DIRECTORY}/config/${CI_ENVIRONMENT_NAME}.json"

# Installing packages and building app.
ssh -o StrictHostKeyChecking=no "${REMOTE_USER}@${DEPLOY_ENDPOINT}" << EOF
  cd ${TARGET_DIRECTORY}
  echo "Installing node modules."
  yarn install
  echo "Building app."
  yarn run build
EOF
