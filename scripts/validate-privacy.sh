#!/bin/bash
# validate-privacy.sh — Scan a .app or .xcarchive for privacy API usage
# and verify all required NSUsageDescription keys exist in Info.plist.
#
# Usage:
#   ./scripts/validate-privacy.sh /path/to/App.app
#   ./scripts/validate-privacy.sh /path/to/Archive.xcarchive
#
# Run BEFORE uploading to App Store Connect to catch ITMS-90683 early.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

TARGET="${1:?Usage: validate-privacy.sh <path-to-.app-or-.xcarchive>}"

# Resolve .app path
if [[ "$TARGET" == *.xcarchive ]]; then
  APP_PATH=$(find "$TARGET/Products" -name "*.app" -maxdepth 3 | head -1)
  if [[ -z "$APP_PATH" ]]; then
    echo -e "${RED}ERROR: No .app found inside xcarchive${NC}"
    exit 1
  fi
elif [[ "$TARGET" == *.app ]]; then
  APP_PATH="$TARGET"
else
  echo -e "${RED}ERROR: Provide a .app bundle or .xcarchive${NC}"
  exit 1
fi

PLIST="$APP_PATH/Info.plist"
if [[ ! -f "$PLIST" ]]; then
  echo -e "${RED}ERROR: Info.plist not found at $PLIST${NC}"
  exit 1
fi

echo "Scanning: $APP_PATH"
echo ""

# Parallel arrays: patterns and their required plist keys
# Only APIs that Apple actually requires Info.plist entries for (ITMS-90683)
PATTERNS=(
  "AVCaptureDevice|AVCaptureSession|AVCaptureVideoPreviewLayer"
  "AVAudioSession|AVAudioRecorder|AVAudioEngine"
  "PHPhotoLibrary|PHAsset|PHPickerViewController"
  "HKHealthStore|HKQuantityType|HKObjectType"
  "HKHealthStore"
  "EKEventStore"
  "CNContactStore"
  "CLLocationManager"
  "CLLocationManager"
  "CLLocationManager"
  "CBCentralManager|CBPeripheralManager"
  "SFSpeechRecognizer|SFSpeechAudioBufferRecognitionRequest"
  "LAContext"
  "NWBrowser|NWListener"
  "CMMotionManager|CMPedometer"
)

PLIST_KEYS=(
  "NSCameraUsageDescription"
  "NSMicrophoneUsageDescription"
  "NSPhotoLibraryUsageDescription"
  "NSHealthShareUsageDescription"
  "NSHealthUpdateUsageDescription"
  "NSCalendarsUsageDescription"
  "NSContactsUsageDescription"
  "NSLocationWhenInUseUsageDescription"
  "NSLocationAlwaysAndWhenInUseUsageDescription"
  "NSLocationAlwaysUsageDescription"
  "NSBluetoothAlwaysUsageDescription"
  "NSSpeechRecognitionUsageDescription"
  "NSFaceIDUsageDescription"
  "NSLocalNetworkUsageDescription"
  "NSMotionUsageDescription"
)

# Collect all strings from binary + frameworks once
BINARY="$APP_PATH/$(defaults read "$PLIST" CFBundleExecutable 2>/dev/null || basename "$APP_PATH" .app)"
FRAMEWORKS_DIR="$APP_PATH/Frameworks"
STRINGS_FILE=$(mktemp)

if [[ -f "$BINARY" ]]; then
  strings "$BINARY" >> "$STRINGS_FILE" 2>/dev/null || true
fi
if [[ -d "$FRAMEWORKS_DIR" ]]; then
  for fw in "$FRAMEWORKS_DIR"/*.framework; do
    FW_NAME=$(basename "$fw" .framework)
    FW_BIN="$fw/$FW_NAME"
    if [[ -f "$FW_BIN" ]]; then
      strings "$FW_BIN" >> "$STRINGS_FILE" 2>/dev/null || true
    fi
  done
fi
if [[ -d "$FRAMEWORKS_DIR" ]]; then
  ls "$FRAMEWORKS_DIR" >> "$STRINGS_FILE" 2>/dev/null || true
fi

ERRORS=0

for i in "${!PATTERNS[@]}"; do
  PATTERN="${PATTERNS[$i]}"
  PLIST_KEY="${PLIST_KEYS[$i]}"

  if grep -qE "$PATTERN" "$STRINGS_FILE"; then
    if /usr/libexec/PlistBuddy -c "Print :$PLIST_KEY" "$PLIST" &>/dev/null; then
      echo -e "${GREEN}✓${NC} $PLIST_KEY — present"
    else
      echo -e "${RED}✗ MISSING: $PLIST_KEY${NC} — API usage detected!"
      echo "  Matched: $PATTERN"
      ERRORS=$((ERRORS + 1))
    fi
  fi
done

rm -f "$STRINGS_FILE"

# List all declared privacy keys (informational)
echo ""
echo "All declared privacy keys:"
/usr/libexec/PlistBuddy -c "Print" "$PLIST" 2>/dev/null | { grep -oE "NS[A-Za-z]*UsageDescription" || true; } | sort -u | while read key; do
  echo -e "  ${YELLOW}ℹ${NC}  $key"
done

echo ""
if [[ $ERRORS -gt 0 ]]; then
  echo -e "${RED}FAILED: $ERRORS missing privacy description(s). Apple WILL reject this build.${NC}"
  echo "Add the missing keys to Info.plist before uploading."
  exit 1
else
  echo -e "${GREEN}PASSED: All detected API usages have matching Info.plist entries.${NC}"
  exit 0
fi
