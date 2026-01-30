#!/bin/bash

# AIFarma iOS Build & Deploy Script
# Usage: ./deploy-ios.sh [device|simulator] [--no-metro]

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IOS_DIR="$PROJECT_DIR/ios"
BUILD_DIR="$IOS_DIR/build"

# Default target
TARGET="${1:-device}"
NO_METRO="${2:-}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  AIFarma iOS Build & Deploy${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Step 1: Generate codegen
echo -e "\n${YELLOW}[1/4] Generating React Native codegen...${NC}"
node node_modules/react-native/scripts/generate-codegen-artifacts.js \
    -p . -t ios -o ios/build/generated > /dev/null 2>&1
echo -e "${GREEN}✓ Codegen generated${NC}"

# Step 2: Build
if [ "$TARGET" = "device" ]; then
    SDK="iphoneos"
    APP_PATH="$BUILD_DIR/Build/Products/Debug-iphoneos/AIFarma.app"
    echo -e "\n${YELLOW}[2/4] Building for physical iPhone...${NC}"
else
    SDK="iphonesimulator"
    APP_PATH="$BUILD_DIR/Build/Products/Debug-iphonesimulator/AIFarma.app"
    echo -e "\n${YELLOW}[2/4] Building for simulator...${NC}"
fi

xcodebuild \
    -workspace "$IOS_DIR/AIFarma.xcworkspace" \
    -scheme AIFarma \
    -configuration Debug \
    -derivedDataPath "$BUILD_DIR" \
    -sdk "$SDK" \
    -arch arm64 \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    IPHONEOS_DEPLOYMENT_TARGET=13.4 2>&1 | grep -E "BUILD|error:" | tail -5

if [ ! -d "$APP_PATH" ]; then
    echo -e "${RED}✗ Build failed - app bundle not found${NC}"
    exit 1
fi

APP_SIZE=$(du -sh "$APP_PATH" | cut -f1)
echo -e "${GREEN}✓ Build successful ($APP_SIZE)${NC}"

# Step 3: Install
echo -e "\n${YELLOW}[3/4] Installing app...${NC}"

if [ "$TARGET" = "simulator" ]; then
    SIMULATOR=$(xcrun simctl list devices | grep "Booted" | head -1 | sed 's/.*(\(.*\)).*/\1/')
    if [ -z "$SIMULATOR" ]; then
        echo -e "${RED}✗ No booted simulator found${NC}"
        echo -e "${YELLOW}Start a simulator first: xcrun simctl boot <device-id>${NC}"
        exit 1
    fi

    xcrun simctl uninstall "$SIMULATOR" com.aifarma.app 2>/dev/null || true
    xcrun simctl install "$SIMULATOR" "$APP_PATH"
    echo -e "${GREEN}✓ App installed in simulator${NC}"

    # Step 4: Launch
    echo -e "\n${YELLOW}[4/4] Launching app...${NC}"
    xcrun simctl launch "$SIMULATOR" com.aifarma.app
    echo -e "${GREEN}✓ App launched in simulator${NC}"
else
    echo -e "${YELLOW}Physical device deployment requires manual steps:${NC}"
    echo -e "${YELLOW}  1. Connect iPhone and unlock${NC}"
    echo -e "${YELLOW}  2. Trust the developer in Settings > General > Device Management${NC}"
    echo -e "${YELLOW}  3. Open Xcode and deploy manually:${NC}"
    echo -e "${BLUE}     open $IOS_DIR/AIFarma.xcworkspace${NC}"
    echo -e "\n${YELLOW}Alternatively, use Xcode's organizer to deploy the build${NC}"
    echo -e "${YELLOW}Build location: $APP_PATH${NC}"
fi

# Step 5: Start Metro bundler (for native builds)
if [ "$TARGET" = "simulator" ] && [ "$NO_METRO" != "--no-metro" ]; then
    echo -e "\n${YELLOW}[5/5] Starting Metro bundler...${NC}"
    echo -e "${BLUE}Metro is required for the native app to load the JavaScript bundle${NC}"
    echo -e "${YELLOW}Keep this terminal open while testing the app${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}\n"

    cd "$PROJECT_DIR"
    npx expo start --ios --clear
fi

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Build & Deploy Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
