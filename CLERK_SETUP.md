# Clerk Authentication Setup Guide

This app now uses Clerk for authentication. Follow these steps to set it up:

## 1. Create a Clerk Account

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. Sign up for a free account
3. Create a new application

## 2. Get Your Publishable Key

1. In your Clerk dashboard, go to **API Keys**
2. Copy the **Publishable Key** (starts with `pk_test_` for development)
3. Open `clerk.config.js` in this project
4. Replace `pk_test_YOUR_PUBLISHABLE_KEY_HERE` with your actual key

## 3. Configure Authentication Methods

In your Clerk dashboard:

1. Go to **User & Authentication** → **Email, Phone, Username**
2. Enable **Email address** (required)
3. Enable **Password** authentication
4. Make sure **Email verification** is enabled (recommended)
5. Save your changes

The app now supports:
- ✅ Email + Password sign up
- ✅ Email + Password sign in
- ✅ Email verification with code
- ✅ Toggle between sign in and sign up screens

## 4. Test the App

1. Make sure you've updated `clerk.config.js` with your key
2. Run `npx expo start --clear`
3. Scan the QR code in Expo Go
4. You should see the sign-in screen

## 5. How to Use

### Sign Up (New Users)

1. Open the app in Expo Go
2. You'll see the sign-in screen
3. Click "Don't have an account? Sign Up"
4. Enter your email and password (min 8 characters)
5. Click "Sign Up"
6. Check your email for a verification code
7. Enter the 6-digit code
8. You're now signed in!

### Sign In (Existing Users)

1. Open the app in Expo Go
2. Enter your email and password
3. Click "Sign In"
4. You're in!

### Sign Out

1. In the home screen, click the "Sign Out" button in the top right
2. You'll be returned to the sign-in screen

## 6. Production Setup

When deploying to production:

1. Get your production publishable key from Clerk (starts with `pk_live_`)
2. Update `clerk.config.js` with the production key
3. Configure your production authentication settings in Clerk dashboard

## Features Enabled

- ✅ User authentication with Clerk
- ✅ Secure token storage with expo-secure-store
- ✅ Sign in/Sign out functionality
- ✅ Protected routes (only signed-in users can access the app)
- ✅ Sign-out button in the home screen

## Troubleshooting

### "Invalid publishable key" error
- Make sure you've replaced the placeholder key in `clerk.config.js`
- Verify the key starts with `pk_test_` or `pk_live_`

### Sign in not working
- Check that you've created a user in Clerk dashboard
- Verify the email/password match what you're entering
- Check the Expo console for error messages

### App crashes on startup
- Make sure all packages are installed: `npm install`
- Clear cache: `npx expo start --clear`
- Check that expo-secure-store is installed

## Need Help?

- Clerk Documentation: [https://clerk.com/docs](https://clerk.com/docs)
- Clerk Expo Guide: [https://clerk.com/docs/quickstarts/expo](https://clerk.com/docs/quickstarts/expo)
