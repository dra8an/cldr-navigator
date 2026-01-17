#!/bin/bash

# Script to verify all tests pass before deployment
# Usage: ./scripts/verify-tests.sh

set -e  # Exit on first error

echo "🧪 CLDR Navigator - Test Verification"
echo "======================================"
echo ""

echo "📦 Installing dependencies..."
npm ci --quiet

echo ""
echo "🔍 Running linter..."
npm run lint

echo ""
echo "🏗️  Building project..."
npm run build > /dev/null

echo ""
echo "✅ Running test suite..."
npm test -- --run

echo ""
echo "📊 Generating coverage report..."
npm test -- --run --coverage

echo ""
echo "✨ All checks passed!"
echo "======================================"
