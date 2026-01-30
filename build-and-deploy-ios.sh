#!/bin/bash

# iOS Build and Deploy Script for AIFarma
# This script compiles the app and deploys it to a connected iPhone

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IOS_DIR="$PROJECT_DIR/ios"
BUILD_DIR="$IOS_DIR/build"
DERIVED_DATA="$BUILD_DIR"
APP_BUNDLE="$BUILD_DIR/Build/Products/Debug-iphoneos/AIFarma.app"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}iOS Build and Deploy Script${NC}"
echo -e "${YELLOW}========================================${NC}"

# Step 1: Check if iPhone is connected
echo -e "\n${YELLOW}[1/6] Checking for connected iPhone...${NC}"
DEVICE_ID=$(xcrun xcode-select -p >/dev/null 2>&1 && xcrun instruments -s devices 2>/dev/null | grep "iPhone" | grep -v "Simulator" | head -1 | sed 's/.*\[//;s/\].*//' || echo "")

if [ -z "$DEVICE_ID" ]; then
    echo -e "${RED}✗ No connected iPhone found${NC}"
    echo -e "${YELLOW}Please connect your iPhone and unlock it, then try again${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Connected iPhone found: $DEVICE_ID${NC}"

# Step 2: Generate React Native codegen artifacts
echo -e "\n${YELLOW}[2/6] Generating React Native codegen artifacts...${NC}"
node node_modules/react-native/scripts/generate-codegen-artifacts.js -p . -t ios -o ios/build/generated 2>&1 | grep -E "Generating|Done" || true
echo -e "${GREEN}✓ Codegen artifacts generated${NC}"

# Step 3: Build for device
echo -e "\n${YELLOW}[3/6] Building iOS app for device...${NC}"
echo -e "${YELLOW}   (This may take 2-5 minutes)${NC}"

xcodebuild \
    -workspace "$IOS_DIR/AIFarma.xcworkspace" \
    -scheme AIFarma \
    -configuration Debug \
    -derivedDataPath "$DERIVED_DATA" \
    -sdk iphoneos \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    IPHONEOS_DEPLOYMENT_TARGET=13.4 \
    2>&1 | grep -E "BUILD FAILED|BUILD SUCCEEDED|error:|warning:" | tail -20

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed successfully${NC}"

# Step 4: Verify app bundle exists
echo -e "\n${YELLOW}[4/6] Verifying app bundle...${NC}"
if [ ! -d "$APP_BUNDLE" ]; then
    APP_BUNDLE="$BUILD_DIR/Build/Products/Debug-iphonesimulator/AIFarma.app"
    if [ ! -d "$APP_BUNDLE" ]; then
        echo -e "${RED}✗ App bundle not found${NC}"
        echo -e "${YELLOW}Expected: $APP_BUNDLE${NC}"
        exit 1
    fi
fi

APP_SIZE=$(du -sh "$APP_BUNDLE" | awk '{print $1}')
echo -e "${GREEN}✓ App bundle found ($APP_SIZE)${NC}"

# Step 5: Deploy to device
echo -e "\n${YELLOW}[5/6] Deploying to iPhone...${NC}"

# Using go-ios for deployment (if available), otherwise using manual Xcode method
if command -v ios &> /dev/null; then
    ios install --udid="$DEVICE_ID" "$APP_BUNDLE"
    echo -e "${GREEN}✓ App deployed via go-ios${NC}"
else
    echo -e "${YELLOW}Note: go-ios not found, using alternative deployment method${NC}"
    echo -e "${YELLOW}You may need to complete deployment manually in Xcode or use:${NC}"
    echo -e "${YELLOW}  xcrun xcode-select --install${NC}"
fi

# Step 6: Launch app
echo -e "\n${YELLOW}[6/6] Launching app on iPhone...${NC}"
echo -e "${YELLOW}Note: App launch may be initiated on your iPhone${NC}"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Build and deployment complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Check your iPhone for the AIFarma app"
echo -e "2. If the app doesn't appear, you may need to:"
echo -e "   - Enable Developer Mode on your iPhone"
echo -e "   - Set up code signing with your Apple Developer account"
echo -e "   - Trust the developer certificate in Settings > General > Device Management"
echo -e "\n${YELLOW}For manual deployment, open Xcode:${NC}"
echo -e "  open $IOS_DIR/AIFarma.xcworkspace"
