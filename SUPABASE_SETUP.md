# Supabase Setup Guide

This guide will help you set up Supabase for the Todo App with GitHub authentication.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `todo-app` (or your preferred name)
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

## Step 2: Get Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env` in your project root
2. Replace the placeholder values:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `supabase-setup.sql`
3. Click "Run" to execute the SQL
4. This will create:
   - `todos` table with user isolation
   - `tags` table with user isolation
   - Row Level Security policies
   - Indexes for performance

## Step 5: Configure GitHub OAuth

1. In Supabase dashboard, go to Authentication > Settings
2. Find "Site URL" and set it to:
   - For development: `http://localhost:3000`
   - For production: `https://yourusername.github.io/work-to-do`

3. Go to Authentication > Settings > Auth Providers
4. Enable "GitHub" provider
5. Create a GitHub OAuth App:

### Create GitHub OAuth App

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: `Todo App` (or your preferred name)
   - **Homepage URL**: `https://yourusername.github.io/work-to-do`
   - **Application description**: `Personal todo management app`
   - **Authorization callback URL**: `https://your-project-id.supabase.co/auth/v1/callback`

4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**

### Configure in Supabase

1. Back in Supabase, in the GitHub provider settings:
   - **Client ID**: Paste your GitHub Client ID
   - **Client Secret**: Paste your GitHub Client Secret
2. Click "Save"

## Step 6: Test the Setup

1. Start your development server: `npm start`
2. The app should show a login page
3. Click "Sign in with GitHub"
4. You should be redirected to GitHub for authentication
5. After approving, you should be redirected back to the app
6. Try creating todos and tags - they should persist in Supabase

## Step 7: Production Deployment

1. Update your GitHub OAuth App's Authorization callback URL to include your production domain:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```

2. In Supabase Auth settings, update the Site URL to your production URL:
   ```
   https://yourusername.github.io/work-to-do
   ```

3. Deploy your app with the environment variables set

## Troubleshooting

### Common Issues

1. **"Invalid redirect URL"**: Check that your Site URL in Supabase matches your app's URL
2. **GitHub OAuth fails**: Verify your GitHub OAuth app callback URL matches Supabase's auth callback
3. **Database errors**: Ensure you ran the SQL setup script and RLS is enabled
4. **Environment variables not loading**: Make sure your `.env` file is in the project root and restart the dev server

### Checking Database

You can verify your setup in Supabase:
1. Go to Table Editor
2. You should see `todos` and `tags` tables
3. Try creating a todo in your app, then refresh the table view to see the data

### Security Notes

- Never commit your `.env` file to git (it's already in `.gitignore`)
- The anon key is safe to use in client-side code
- Row Level Security ensures users can only access their own data
- All database operations are authenticated and isolated by user

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check the Supabase logs in your dashboard
3. Verify all URLs and keys are correct
4. Ensure your database schema was created successfully