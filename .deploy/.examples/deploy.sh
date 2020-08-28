#!/bin/sh

# Restart nginx
ssh -o StrictHostKeyChecking=no "${REMOTE_USER}@${DEPLOY_ENDPOINT}" << EOF
  sudo systemctl restart nginx
EOF
