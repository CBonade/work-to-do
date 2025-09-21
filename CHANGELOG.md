# Changelog

All notable changes to Odd Jobs will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-09-21

### 🎉 Major Release: Cloud-First Multi-User Platform

This is a complete rewrite transforming the app from a local-only tool to a cloud-based multi-user platform.

### Added
- **Multi-User Support**: Complete user authentication and data isolation
- **GitHub OAuth Authentication**: Secure, passwordless login via GitHub
- **Cloud Data Persistence**: All data stored in Supabase cloud database
- **Real-time Sync**: Access your todos from any device
- **Data Migration**: Automatic migration from localStorage to cloud on first login
- **Professional Branding**: New "Odd Jobs" brand identity with modern teal design
- **Security**: Row Level Security (RLS) ensures complete data privacy
- **Scalable Architecture**: Built for multiple users with single deployment

### Changed
- **App Name**: Rebranded from "My To-Do App" to "Odd Jobs"
- **Logo Design**: New target 🎯 icon with teal gradient branding
- **Color Scheme**: Modern teal gradient replacing previous orange theme
- **Architecture**: Complete backend migration from localStorage to Supabase
- **Authentication**: From anonymous local use to GitHub-based user accounts
- **Data Storage**: From browser localStorage to cloud PostgreSQL database

### Technical Improvements
- **Database**: PostgreSQL with Supabase backend
- **Authentication**: Supabase Auth with GitHub OAuth provider
- **Security**: Row Level Security policies for data isolation
- **Performance**: Database indexing for optimized queries
- **Deployment**: GitHub Pages with environment variable configuration
- **Scalability**: Multi-tenant architecture supporting unlimited users

### Security Enhancements
- Environment variables properly secured and ignored in git
- Database access controlled via Row Level Security
- User data completely isolated between accounts
- Secure GitHub OAuth integration
- API keys protected from public repository exposure

### Developer Experience
- Comprehensive setup documentation in `SUPABASE_SETUP.md`
- Environment variable template in `.env.example`
- Database schema provided in `supabase-setup.sql`
- Clear migration path from localStorage to cloud

---

## [1.0.0] - 2025-01-20

### Initial Release
- Basic todo management with work/personal contexts
- Tag system for organizing tasks
- Drag and drop reordering
- Local storage persistence
- Dark theme interface
- Rich text editing with Lexical
- Single-user localStorage-based system

---

## How to Deploy

1. **Prepare for deployment:**
   ```bash
   npm run build
   ```

2. **Create git tag:**
   ```bash
   git tag -a v2.0.0 -m "Major release: Multi-user cloud platform"
   ```

3. **Deploy to GitHub Pages:**
   ```bash
   npm run deploy
   ```

4. **Push tags:**
   ```bash
   git push origin --tags
   ```

## Version Strategy

- **Major (X.0.0)**: Breaking changes, new architecture, major features
- **Minor (X.Y.0)**: New features, significant improvements
- **Patch (X.Y.Z)**: Bug fixes, small improvements

## Deployment Checklist

- [ ] All environment variables configured in GitHub Pages settings
- [ ] Supabase project properly configured
- [ ] GitHub OAuth app set up and configured
- [ ] Database schema deployed
- [ ] Changelog updated
- [ ] Version tag created
- [ ] Deployment tested and verified