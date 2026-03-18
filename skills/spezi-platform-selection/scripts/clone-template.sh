#!/bin/sh
#
# This source file is part of the Stanford Spezi open-source project.
#
# SPDX-FileCopyrightText: 2026 Stanford University and the project authors (see CONTRIBUTORS.md)
#
# SPDX-License-Identifier: MIT
#

set -eu

if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <project-name> <destination>" >&2
  echo "Projects: rn-cs342-template | spezi-template" >&2
  exit 1
fi

PROJECT_NAME="$1"
DESTINATION="$2"

case "$PROJECT_NAME" in
  rn-cs342-template)
    REMOTE_URL="https://github.com/CS342/ReactNativeTemplateApplication"
    ;;
  spezi-template)
    REMOTE_URL="https://github.com/StanfordSpezi/SpeziTemplateApplication"
    ;;
  *)
    echo "Unknown project: $PROJECT_NAME" >&2
    echo "Supported projects: rn-cs342-template | spezi-template" >&2
    exit 1
    ;;
esac

git clone "$REMOTE_URL" "$DESTINATION"
