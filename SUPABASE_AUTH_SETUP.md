# Supabase Authentication Setup Guide

## Issue: 401 Unauthorized Errors on Signup/Login

If you're experiencing 401 errors when trying to sign up or log in, it's likely due to Supabase API key configuration.

## Required Configuration

For backend authentication operations (signup, signin), you need the **SERVICE_ROLE_KEY**, not the anon/publishable key.

### Current Configuration Issue

Your `.env` file currently has:
```
SUPABASE_ANON_KEY=sb_publishable_vl5anaPxMpOojIrGZcp6nQ_Iov5sKjD
```

This is a **publishable key** (starts with `sb_publishable_`), which has limited permissions and may not work for backend user creation.

### Solution

1. **Get your Supabase Service Role Key:**
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the **`service_role`** key (NOT the anon key)
   - ⚠️ **WARNING**: This key has admin privileges - keep it secret!

2. **Update your `backend/.env` file:**
   ```env
   SUPABASE_URL=https://rkfnimpgxmkmqxlkzxur.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Restart your backend server:**
   ```bash
   cd backend
   npm run start:dev
   ```

## Alternative: Use Anon Key (Limited)

If you want to use the anon key, you need to:
1. Enable email confirmation in Supabase Auth settings
2. Users will need to confirm their email before logging in
3. Some operations may still be restricted

## Verification

After updating, check the backend console for:
- ✅ `Supabase client initialized successfully` - Good!
- ❌ `Supabase configuration missing` - Check your .env file
- ❌ `Failed to initialize Supabase client` - Check your keys

## Testing

Try signing up with a new email. You should see:
- Success message
- User created in database
- Access token returned

If you still get 401 errors, check:
1. Backend console logs for specific Supabase errors
2. Supabase project is active (not paused)
3. Auth is enabled in Supabase project settings
4. Email confirmation settings (if using anon key)

