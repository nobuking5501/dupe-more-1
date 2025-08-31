#!/bin/bash

# E2E Test Runner for Daily Report Pipeline
# Make sure the admin panel is running on :3002 before running this

echo "🧪 Starting Pipeline E2E Tests"
echo "================================="

# Check if server is running
echo "Checking if admin panel is running on :3002..."
if ! curl -s http://localhost:3002/api/health > /dev/null; then
    echo "❌ Admin panel is not running on :3002"
    echo "Please start the admin panel first:"
    echo "  cd admin-panel && npm run dev"
    exit 1
fi

echo "✅ Admin panel is running"

# Run the E2E tests
echo "Running E2E tests..."
node tests/e2e/pipeline.test.js

# Check exit code
if [ $? -eq 0 ]; then
    echo "🎉 All tests passed!"
else
    echo "❌ Some tests failed. Check the output above."
    exit 1
fi