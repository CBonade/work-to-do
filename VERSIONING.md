# Versioning Workflow

This document outlines the versioning and release process for the Todo App.

## Version Numbering

We use [Semantic Versioning](https://semver.org/) (SemVer):
- **MAJOR** version for incompatible API changes or significant feature overhauls
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

## Release Process

### 1. Update Version Information

1. **Update package.json version**:
   ```bash
   # For a new major version (e.g., 2.0.0 -> 3.0.0)
   npm version major

   # For a new minor version (e.g., 2.0.0 -> 2.1.0)
   npm version minor

   # For a new patch version (e.g., 2.0.0 -> 2.0.1)
   npm version patch
   ```

2. **Update README.md changelog**:
   - Add new version entry at the top of the changelog
   - Include the current date
   - List all features, improvements, and bug fixes
   - Follow the existing format for consistency

### 2. Create Git Tag

```bash
# Stage and commit version changes
git add .
git commit -m "Update to vX.Y.Z with changelog"

# Create annotated tag with detailed message
git tag -a vX.Y.Z -m "Version X.Y.Z: Brief Description

Major Features:
- Feature 1
- Feature 2

Technical Improvements:
- Improvement 1
- Improvement 2"

# Push commits and tags
git push origin main
git push origin vX.Y.Z
```

### 3. Create GitHub Release

#### Option A: Using GitHub CLI (if authenticated)
```bash
gh release create vX.Y.Z \
  --title "vX.Y.Z: Release Title" \
  --notes-file RELEASE_NOTES.md
```

#### Option B: Using GitHub Web Interface
1. Go to the repository on GitHub
2. Click "Releases" in the right sidebar
3. Click "Create a new release"
4. Select the tag you just pushed
5. Add a descriptive title and detailed release notes
6. Publish the release

### 4. Deploy

The app automatically deploys to GitHub Pages. Optionally run:
```bash
npm run deploy
```

## Release Notes Template

```markdown
## 🎉 Release: vX.Y.Z - Release Title

Brief description of the release.

### 🚀 Features
- New feature 1
- New feature 2

### 🔧 Improvements
- Improvement 1
- Improvement 2

### 🐛 Bug Fixes
- Fix 1
- Fix 2

### 🛠️ Breaking Changes
- Breaking change 1 (if any)

### 📱 Technical Details
- Technical improvement 1
- Technical improvement 2

**Live Demo**: [https://cbonade.github.io/work-to-do](https://cbonade.github.io/work-to-do)
```

## Current Version

**Latest**: v2.0.0 (2025-09-19) - Tag Management & Enhanced Layout

## Version History

All versions are documented in the README.md changelog section.