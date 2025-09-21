#!/bin/bash

# Automated release script for Odd Jobs
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

# Default to patch if no argument provided
BUMP_TYPE=${1:-patch}

echo "🚀 Starting release process..."

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Working directory is not clean. Please commit or stash changes first."
    exit 1
fi

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: $CURRENT_VERSION"

# Bump version in package.json
echo "⬆️ Bumping $BUMP_TYPE version..."
npm version $BUMP_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "📦 New version: $NEW_VERSION"

# Update manifest.json version
echo "📱 Updating manifest.json version..."
sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" public/manifest.json
rm -f public/manifest.json.bak

# Commit version changes
echo "💾 Committing version changes..."
git add package.json public/manifest.json
git commit -m "chore: bump version to $NEW_VERSION"

# Create git tag
echo "🏷️ Creating git tag v$NEW_VERSION..."
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to GitHub Pages
echo "🚀 Deploying to GitHub Pages..."
npm run deploy

# Push changes and tags
echo "📤 Pushing to GitHub..."
git push origin main
git push origin --tags

echo "✅ Release v$NEW_VERSION completed successfully!"
echo "🌐 Deployed to: https://cbonade.github.io/work-to-do"
echo "📝 Don't forget to update CHANGELOG.md with release notes"