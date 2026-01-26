# City Flyers MVP

A hyperlocal flyer discovery mobile application built with Expo React Native.

## Setup Instructions

### 1. Firebase Configuration

Before running the app, you need to set up Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Choose your preferred location
4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click "Add app" and select Web app
   - Copy the configuration object

**Note:** This app uses Base64 image storage in Firestore instead of Firebase Storage to keep it completely free.

### 2. Update Firebase Configuration

Edit `firebase.config.js` and replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

### 3. Clerk Authentication Setup

Before running the app, you need to set up Clerk authentication:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application or use an existing one
3. Get your publishable key from API Keys section
4. Copy `clerk.config.example.js` to `clerk.config.js`:
   ```bash
   copy clerk.config.example.js clerk.config.js
   ```
5. Update `clerk.config.js` with your actual Clerk publishable key
6. Enable authentication methods in Clerk dashboard:
   - Email + Password
   - Google OAuth (recommended)

**Important:** `clerk.config.js` is in `.gitignore` and should never be committed to git!

See `CLERK_SETUP.md` for detailed setup instructions.

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the App

```bash
npm start
```

Then scan the QR code with Expo Go app on your mobile device.

## Project Structure

```
CityFlyers/
├── screens/           # Screen components
├── services/          # Business logic services
├── firebase.config.js # Firebase configuration
├── App.js            # Main app component
└── package.json      # Dependencies
```

## Features

- **Authentication with Clerk:**
  - Google OAuth (one-click sign in)
  - Email + Password sign up/sign in
  - Email verification
  - Secure session management
- Location-based flyer discovery
- Flyer posting (authenticated users only)
- Base64 image storage (no external storage costs)
- Automatic flyer expiration (7 days)
- Distance-based filtering
- Interactive map for custom location selection

## Requirements

- Node.js 16+
- Expo CLI
- Expo Go app on mobile device
- Firebase project with Firestore enabled (Storage not required)