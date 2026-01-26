# Authentication Features

## ✅ Implemented Features

### Google OAuth (One-Click Sign In)
- Sign in with Google account
- No password needed
- Instant authentication
- Works in Expo Go
- Uses Clerk's OAuth flow

### Sign Up
- Email + Password registration
- Password validation (minimum 8 characters)
- Email verification with 6-digit code
- Automatic sign-in after verification

### Sign In
- Email + Password authentication
- Error handling for invalid credentials
- Session management with secure token storage

### User Interface
- Clean, modern sign-in/sign-up screen
- Toggle between sign-in and sign-up modes
- Email verification screen
- Loading states and error messages
- Keyboard-aware scrolling

### User Management
- Display user email in home screen
- Sign-out button in header
- Protected routes (must be signed in to access app)
- Secure token storage with expo-secure-store

## How It Works

1. **Google Sign In (Recommended):**
   - Click "Continue with Google"
   - Select your Google account
   - Automatically signed in
   - No password to remember!

2. **First Time Users (Email):**
   - Click "Don't have an account? Sign Up"
   - Enter email and password
   - Receive verification code via email
   - Enter code to verify
   - Automatically signed in

2. **Returning Users:**
   - Enter email and password
   - Click "Sign In"
   - Access the app immediately

3. **Signed In Users:**
   - See their email in the header
   - Can post flyers
   - Can sign out anytime

## Setup Required

You need to configure Clerk in your dashboard:

1. Get your publishable key from https://dashboard.clerk.com
2. Update `clerk.config.js` with your key
3. Enable Email + Password authentication in Clerk dashboard
4. Enable Google OAuth in Social Connections (optional but recommended)
5. Enable Email verification (recommended)

**Google OAuth works immediately with Clerk's development credentials!**

See `CLERK_SETUP.md` for detailed instructions.

## Security Features

- ✅ Passwords are never stored locally
- ✅ Secure token storage with expo-secure-store
- ✅ Email verification required
- ✅ Session management by Clerk
- ✅ Protected routes (no access without sign-in)

## Tech Stack

- **@clerk/clerk-expo** - Authentication provider
- **expo-secure-store** - Secure token storage
- **expo-web-browser** - OAuth browser flow
- **Clerk Dashboard** - User management and configuration
- **Google OAuth** - One-click sign in
