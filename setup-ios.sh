#!/bin/bash

# iOS Setup Script
# One-time setup for iOS development

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  AIFarma iOS Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check Xcode
echo -e "\n${YELLOW}[1/5] Checking Xcode...${NC}"
if ! xcode-select -p >/dev/null 2>&1; then
    echo -e "${YELLOW}Xcode Command Line Tools not found${NC}"
    echo -e "${YELLOW}Installing...${NC}"
    xcode-select --install
fi
XCODE_VERSION=$(xcodebuild -version | head -1)
echo -e "${GREEN}✓ $XCODE_VERSION${NC}"

# Check Node.js
echo -e "\n${YELLOW}[2/5] Checking Node.js...${NC}"
NODE_VERSION=$(node -v)
npm_VERSION=$(npm -v)
echo -e "${GREEN}✓ Node.js $NODE_VERSION${NC}"
echo -e "${GREEN}✓ npm $npm_VERSION${NC}"

# Install npm dependencies
echo -e "\n${YELLOW}[3/5] Installing npm dependencies...${NC}"
npm install --legacy-peer-deps > /dev/null 2>&1
echo -e "${GREEN}✓ npm dependencies installed${NC}"

# Install CocoaPods
echo -e "\n${YELLOW}[4/5] Installing CocoaPods...${NC}"
cd ios
pod install --repo-update > /dev/null 2>&1
cd ..
echo -e "${GREEN}✓ CocoaPods dependencies installed${NC}"

# Generate codegen
echo -e "\n${YELLOW}[5/5] Generating React Native codegen...${NC}"
node node_modules/react-native/scripts/generate-codegen-artifacts.js \
    -p . -t ios -o ios/build/generated > /dev/null 2>&1
echo -e "${GREEN}✓ Codegen artifacts generated${NC}"

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. For Simulator: \`./deploy-ios.sh simulator\`"
echo -e "2. For Device: \`./deploy-ios.sh device\` (requires code signing setup)"
echo -e "3. Read iOS-DEPLOYMENT.md for detailed instructions"
