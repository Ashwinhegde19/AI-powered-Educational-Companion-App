#!/bin/bash

# Android Environment Setup Script
# Run this script after setting up Android SDK through Android Studio

echo "Setting up Android development environment..."

# Common Android SDK paths (adjust if your installation is different)
ANDROID_HOME_CANDIDATES=(
    "$HOME/Android/Sdk"
    "$HOME/Library/Android/sdk"
    "/opt/android-sdk"
)

ANDROID_HOME=""
for path in "${ANDROID_HOME_CANDIDATES[@]}"; do
    if [ -d "$path" ]; then
        ANDROID_HOME="$path"
        break
    fi
done

if [ -z "$ANDROID_HOME" ]; then
    echo "❌ Android SDK not found. Please install Android SDK through Android Studio first."
    echo "1. Open Android Studio"
    echo "2. Go to Tools > SDK Manager"
    echo "3. Install Android SDK and Android SDK Platform-Tools"
    echo "4. Note the SDK Location path"
    exit 1
fi

echo "✅ Found Android SDK at: $ANDROID_HOME"

# Add environment variables to .bashrc
echo "" >> ~/.bashrc
echo "# Android Development Environment" >> ~/.bashrc
echo "export ANDROID_HOME=$ANDROID_HOME" >> ~/.bashrc
echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> ~/.bashrc
echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> ~/.bashrc
echo "export PATH=\$PATH:\$ANDROID_HOME/tools" >> ~/.bashrc

echo "✅ Environment variables added to ~/.bashrc"
echo "🔄 Please run: source ~/.bashrc"
echo "   Or restart your terminal"

echo ""
echo "🎯 Next steps:"
echo "1. Create an Android Virtual Device (AVD) in Android Studio"
echo "2. Start the emulator or connect a physical device"
echo "3. Run: cd frontend && pnpm run android"
