#!/bin/bash

# AI Educational Companion App - Status Checker

echo "🔍 Checking AI Educational Companion App Status..."
echo ""

# Check if backend is running
echo "📡 Backend Status:"
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend is running on port 3000"
    BACKEND_RESPONSE=$(curl -s http://localhost:3000/health)
    echo "   Response: $BACKEND_RESPONSE"
else
    echo "❌ Backend is not running"
    echo "   💡 To start: cd backend && pnpm run dev"
fi

echo ""

# Check if Metro bundler is running
echo "📱 Frontend (Metro Bundler) Status:"
if pgrep -f "react-native.*start" > /dev/null; then
    echo "✅ Metro bundler is running"
    echo "   Metro processes: $(pgrep -f 'react-native.*start' | wc -l)"
else
    echo "❌ Metro bundler is not running"
    echo "   💡 To start: cd frontend && pnpm start"
fi

echo ""

# Check Node.js processes
echo "⚙️  Active Node.js Processes:"
NODE_PROCESSES=$(pgrep -f node | wc -l)
if [ $NODE_PROCESSES -gt 0 ]; then
    echo "✅ Found $NODE_PROCESSES Node.js processes running"
    echo "   Backend: $(pgrep -f "nodemon\|src/server.js" | wc -l) processes"
    echo "   Frontend: $(pgrep -f "react-native" | wc -l) processes"
else
    echo "❌ No Node.js processes found"
fi

echo ""

# Check if Android emulator is running
echo "📱 Android Emulator Status:"
if command -v adb > /dev/null 2>&1; then
    DEVICES=$(adb devices | grep -c "device$")
    if [ $DEVICES -gt 0 ]; then
        echo "✅ Android device/emulator connected ($DEVICES device(s))"
        echo "   💡 To run app: cd frontend && pnpm android"
    else
        echo "❌ No Android devices connected"
        echo "   💡 Start Android emulator first"
    fi
else
    echo "⚠️  ADB not found - Android SDK not installed"
fi

echo ""

# Summary
echo "📊 Quick Status Summary:"
echo "==========================="
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "Backend:  ✅ RUNNING"
else
    echo "Backend:  ❌ STOPPED"
fi

if pgrep -f "react-native.*start" > /dev/null; then
    echo "Frontend: ✅ RUNNING (Metro)"
else
    echo "Frontend: ❌ STOPPED"
fi

echo ""
echo "🚀 Next Steps:"
echo "- Backend API: http://localhost:3000"
echo "- API Testing: node test-api.js"
echo "- Frontend: Open new terminal → cd frontend && pnpm android"
echo "- Documentation: See STATUS.md for details"
