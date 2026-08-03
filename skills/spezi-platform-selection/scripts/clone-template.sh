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
  echo "Usage: $0 <platform> <destination>" >&2
  echo "Platforms: react-native | apple-native" >&2
  exit 1
fi

PROJECT_NAME="$1"
DESTINATION="$2"

case "$PROJECT_NAME" in
  react-native)
    REMOTE_URL="https://github.com/StanfordSpezi/SpeziVibeReactNativeTemplate"
    ;;
  apple-native)
    REMOTE_URL="https://github.com/StanfordSpezi/SpeziTemplateApplication"
    ;;
  *)
    echo "Unknown platform: $PROJECT_NAME" >&2
    echo "Supported platforms: react-native | apple-native" >&2
    exit 1
    ;;
esac

git clone "$REMOTE_URL" "$DESTINATION"

# The user's project must not push to the Stanford template repository.
git -C "$DESTINATION" remote rename origin template

echo ""
echo "Cloned $REMOTE_URL into $DESTINATION."
echo "The template remains available as the 'template' remote."
echo "Before pushing, create your own repository and add it as 'origin':"
echo "  git -C $DESTINATION remote add origin <your-repository-url>"
