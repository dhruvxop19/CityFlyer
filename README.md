# 🎯 City Flyers

<div align="center">

**A hyperlocal flyer discovery mobile application built with Expo React Native**

[![Expo](https://img.shields.io/badge/Expo-~54.0.30-000020?style=flat&logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.7.0-FFCA28?style=flat&logo=firebase)](https://firebase.google.com/)
[![Clerk](https://img.shields.io/badge/Clerk-2.19.20-6C47FF?style=flat)](https://clerk.com/)
[![Tests](https://img.shields.io/badge/Tests-81%20Passing-success?style=flat)]()

</div>

---

## 📱 About

City Flyers is a location-based mobile app that lets users discover and post digital flyers in their local area. Think of it as a digital bulletin board for your neighborhood - post events, services, sales, or announcements and have them automatically appear for nearby users.

### ✨ Key Highlights

- 🔐 **Secure Authentication** - Google OAuth & Email/Password via Clerk
- 📍 **Location-Based Discovery** - Find flyers within customizable radius (1-5km)
- 🗺️ **Interactive Maps** - OpenStreetMap integration with search & pin selection
- 🎨 **Modern UI** - Beautiful gradient design with smooth animations
- 💾 **Zero Storage Costs** - Base64 image storage in Firestore
- ⏰ **Auto-Expiration** - Flyers automatically expire after 7 days
- 📱 **Expo Go Compatible** - No development build required
- ✅ **Fully Tested** - 81 passing tests across 11 test suites

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16 or higher
- **npm** or **yarn**
- **Expo Go** app on your mobile device ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- **Firebase** account (free tier)
- **Clerk** account (free tier)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd CityFlyers
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase** (see [Firebase Setup](#firebase-setup))

4. **Configure Clerk** (see [Clerk Setup](#clerk-setup))

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Scan QR code** with Expo Go app on your device

---

## ⚙️ Configuration

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the wizard
   - Choose a project name (e.g., "city-flyers")

2. **Enable Firestore Database**
   - Navigate to **Firestore Database** in the left sidebar
   - Click "Create database"
   - Select **Production mode**
   - Choose your preferred location (closest to your users)

3. **Get Configuration**
   - Go to **Project Settings** (gear icon) > **General**
   - Scroll to "Your apps" section
   - Click **Web** icon (</>) to add a web app
   - Register app and copy the `firebaseConfig` object

4. **Update Configuration File**
   
   Edit `firebase.config.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",                    // Your actual API key
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

5. **Firestore Security Rules** (Optional but recommended)
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /flyers/{flyerId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

### Clerk Setup

1. **Create Clerk Application**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com/)
   - Click "Add application"
   - Choose a name (e.g., "City Flyers")
   - Select authentication methods:
     - ✅ Email
     - ✅ Google (recommended)

2. **Get Publishable Key**
   - In your Clerk dashboard, go to **API Keys**
   - Copy the **Publishable Key** (starts with `pk_test_...`)

3. **Create Configuration File**
   ```bash
   # Windows
   copy clerk.config.example.js clerk.config.js
   
   # macOS/Linux
   cp clerk.config.example.js clerk.config.js
   ```

4. **Update Configuration**
   
   Edit `clerk.config.js`:
   ```javascript
   export const clerkConfig = {
     publishableKey: 'pk_test_your_actual_key_here'
   };
   ```

5. **Configure OAuth (for Google Sign-In)**
   - In Clerk dashboard, go to **User & Authentication** > **Social Connections**
   - Enable **Google**
   - Follow Clerk's instructions to set up OAuth credentials

**⚠️ Important:** `clerk.config.js` is in `.gitignore` and should NEVER be committed!

For detailed instructions, see [`CLERK_SETUP.md`](./CLERK_SETUP.md)

---

## 📂 Project Structure

```
CityFlyers/
├── screens/                    # UI Screen Components
│   ├── SignInScreen.js        # Authentication screen
│   ├── HomeFeedScreen.js      # Main feed with flyer discovery
│   ├── AddFlyerScreen.js      # Create new flyer
│   ├── FlyerDetailScreen.js   # View flyer details
│   └── __tests__/             # Screen tests
├── services/                   # Business Logic Layer
│   ├── FlyerService.js        # Flyer CRUD operations
│   ├── LocationService.js     # Location & distance calculations
│   └── __tests__/             # Service tests
├── utils/                      # Utility Functions
│   └── ErrorHandler.js        # Centralized error handling
├── __mocks__/                  # Jest mocks for testing
│   ├── firebase/
│   └── firebase.config.js
├── assets/                     # Images and static files
├── app/                        # Expo Router files (legacy)
├── firebase.config.js         # Firebase configuration
├── clerk.config.js            # Clerk configuration (gitignored)
├── clerk.config.example.js    # Clerk config template
├── App.js                     # Main app entry point
├── index.js                   # Expo entry point
├── babel.config.js            # Babel configuration
├── jest.setup.js              # Jest test setup
├── package.json               # Dependencies
├── README.md                  # This file
├── CLERK_SETUP.md            # Detailed Clerk setup guide
├── AUTH_FEATURES.md          # Authentication features documentation
├── MAPS_FEATURE.md           # Maps feature documentation
└── UI_UPDATES.md             # UI design documentation
```

---

## 🎨 Features

### 🔐 Authentication
- **Google OAuth** - One-click sign in with Google account
- **Email/Password** - Traditional sign up and sign in
- **Email Verification** - Secure account verification flow
- **Session Management** - Persistent authentication with Clerk
- **Sign Out** - Clean session termination

### 📍 Location Services
- **Current Location** - Automatic GPS-based location detection
- **Custom Location** - Select any location worldwide
- **Address Search** - Search by address, city, or landmark
- **Interactive Map** - OpenStreetMap with tap-to-select
- **Manual Coordinates** - Enter latitude/longitude directly
- **Apple Maps Integration** - Native maps for iOS users
- **Distance Calculation** - Haversine formula for accurate distances

### 🗺️ Map Features
- **OpenStreetMap** - Free, no API key required
- **Search Functionality** - Nominatim geocoding service
- **Draggable Marker** - Adjust location by dragging
- **Zoom Controls** - Zoom in/out for precision
- **Platform Detection** - iOS gets Apple Maps option
- **WebView Integration** - Smooth in-app map experience

### 📋 Flyer Management
- **Create Flyers** - Post with image, title, description, category
- **Categories** - Event, Service, Sale, Announcement
- **Visibility Radius** - 1km, 3km, or 5km range
- **Image Upload** - Select from photo library
- **Base64 Storage** - Images stored directly in Firestore
- **Auto-Expiration** - Flyers expire after 7 days
- **Distance Display** - Shows distance from user

### 🎯 Discovery Feed
- **Location-Based** - Only shows nearby flyers
- **Distance Filtering** - Filters by flyer's visibility radius
- **Expiration Filtering** - Hides expired flyers
- **Real-Time Updates** - Firestore real-time sync
- **Card Layout** - Beautiful card-based UI
- **Detail View** - Tap to see full flyer details

### 🎨 Modern UI/UX
- **Gradient Design** - Purple to violet gradient theme
- **Smooth Shadows** - Colored shadows for depth
- **Rounded Corners** - Modern, soft design language
- **Responsive Layout** - Works on all screen sizes
- **Loading States** - Activity indicators for async operations
- **Error Handling** - User-friendly error messages
- **Empty States** - Helpful messages when no content

---

## 🧪 Testing

The project includes comprehensive test coverage with **81 passing tests** across **11 test suites**.

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage

- ✅ **Screen Tests** - UI component rendering and interactions
- ✅ **Service Tests** - Business logic and data operations
- ✅ **Location Tests** - Distance calculations and GPS
- ✅ **Error Handling** - Error scenarios and recovery
- ✅ **Filtering Tests** - Distance and expiration filtering
- ✅ **Navigation Tests** - Screen navigation flows
- ✅ **Anonymous Access** - Unauthenticated user scenarios

### Test Files

```
__tests__/
├── screens/
│   ├── HomeFeedScreen.test.js
│   ├── AddFlyerScreen.test.js
│   ├── FlyerDetailScreen.test.js
│   └── Navigation.test.js
└── services/
    ├── FlyerService.test.js
    ├── LocationService.test.js
    ├── FlyerCreation.test.js
    ├── DistanceFiltering.test.js
    ├── ExpiredFlyerFiltering.test.js
    ├── ErrorHandling.test.js
    └── AnonymousAccess.test.js
```

---

## 🛠️ Tech Stack

### Core
- **[Expo](https://expo.dev/)** ~54.0.30 - React Native framework
- **[React Native](https://reactnative.dev/)** 0.81.5 - Mobile app framework
- **[React](https://react.dev/)** 19.1.0 - UI library

### Backend & Services
- **[Firebase](https://firebase.google.com/)** 12.7.0 - Firestore database
- **[Clerk](https://clerk.com/)** 2.19.20 - Authentication service

### UI & Components
- **[expo-linear-gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)** - Gradient backgrounds
- **[react-native-webview](https://github.com/react-native-webview/react-native-webview)** - Map integration

### Location & Media
- **[expo-location](https://docs.expo.dev/versions/latest/sdk/location/)** - GPS and geocoding
- **[expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)** - Photo selection

### Testing
- **[Jest](https://jestjs.io/)** 30.2.0 - Test framework
- **[@testing-library/react-native](https://callstack.github.io/react-native-testing-library/)** 13.3.3 - Component testing
- **[fast-check](https://fast-check.dev/)** 4.5.3 - Property-based testing

---

## 📱 Screens

### 1. Sign In Screen
- Google OAuth button
- Email/Password sign in form
- Sign up flow with email verification
- Gradient background design

### 2. Home Feed Screen
- Gradient header with user greeting
- Post and sign out buttons
- Scrollable flyer cards
- Distance badges
- Category labels
- Empty state messaging

### 3. Add Flyer Screen
- Image picker with preview
- Title and description inputs
- Category selector (4 options)
- Location type selector:
  - Current location
  - Custom location (address search, map, or coordinates)
- Visibility radius selector (1km, 3km, 5km)
- Submit button with loading states

### 4. Flyer Detail Screen
- Large flyer image
- Title and distance badge
- Category badge
- Full description
- Posted date
- Expiration status
- Visibility radius
- Back navigation

---

## 🎨 Design System

### Color Palette
```
Primary Gradient:  #667eea → #764ba2 (Purple to Violet)
Success:           #34c759 (Green)
Warning:           #FF9500 (Orange)
Danger:            #FF3B30 (Red)
Background:        #f8f9fa (Light Gray)
Card Background:   #ffffff (White)
Text Primary:      #333333
Text Secondary:    #666666
```

### Typography
- **Headers**: 22-32px, Bold
- **Body**: 14-16px, Regular
- **Labels**: 13-14px, Semi-bold
- **Buttons**: 14-18px, Bold

### Spacing
- **Small**: 8-10px
- **Medium**: 15-20px
- **Large**: 25-30px

### Shadows
- **Small**: offset (0, 2), opacity 0.05, radius 4
- **Medium**: offset (0, 4), opacity 0.2-0.3, radius 6-8
- **Large**: offset (0, 6), opacity 0.4, radius 10

For detailed UI documentation, see [`UI_UPDATES.md`](./UI_UPDATES.md)

---

## 🔒 Security

### Authentication
- Clerk handles all authentication securely
- JWT tokens for session management
- OAuth 2.0 for Google sign-in
- Email verification required

### Data Protection
- Firestore security rules (recommended setup above)
- Client-side validation
- Server-side validation via Firestore rules
- No sensitive data in client code

### Configuration Security
- `clerk.config.js` in `.gitignore`
- Environment-specific configs
- No hardcoded secrets in repository

---

## 🚧 Known Limitations

1. **Image Size**: Base64 storage has Firestore document size limits (1MB)
2. **Offline Support**: Limited offline functionality
3. **Real-time Updates**: Requires active internet connection
4. **Map Provider**: OpenStreetMap may have rate limits for heavy usage
5. **Expo Go Only**: Requires Expo Go app, not standalone build

---

## 🗺️ Roadmap

### Planned Features
- [ ] Push notifications for nearby flyers
- [ ] User profiles and flyer history
- [ ] Flyer categories with icons
- [ ] Report/flag inappropriate content
- [ ] Favorite/bookmark flyers
- [ ] Share flyers via social media
- [ ] Dark mode support
- [ ] Standalone app builds (iOS/Android)
- [ ] Image compression before upload
- [ ] Multiple image support per flyer

---

## 📄 Additional Documentation

- **[CLERK_SETUP.md](./CLERK_SETUP.md)** - Detailed Clerk authentication setup
- **[AUTH_FEATURES.md](./AUTH_FEATURES.md)** - Authentication features overview
- **[MAPS_FEATURE.md](./MAPS_FEATURE.md)** - Maps integration documentation
- **[UI_UPDATES.md](./UI_UPDATES.md)** - UI design system and updates

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Write tests for new features
- Follow existing code style
- Update documentation
- Test on both iOS and Android (Expo Go)

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **[Expo](https://expo.dev/)** - Amazing React Native framework
- **[Firebase](https://firebase.google.com/)** - Reliable backend services
- **[Clerk](https://clerk.com/)** - Seamless authentication
- **[OpenStreetMap](https://www.openstreetmap.org/)** - Free map data
- **[Nominatim](https://nominatim.org/)** - Geocoding service

---

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation files
- Review test files for usage examples

---

<div align="center">

**Built with ❤️ using Expo React Native**

[⬆ Back to Top](#-city-flyers)

</div>