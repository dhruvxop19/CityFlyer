# 👤 Profile Feature

## Overview

The Profile screen allows users to view and edit their personal information, manage their account, and sign out securely.

---

## 🎯 Features

### Personal Information
- **Email Address** (Read-only) - Managed by Clerk authentication
- **First Name** (Editable) - User's first name
- **Last Name** (Editable) - User's last name
- **Edit Mode** - Toggle between view and edit modes

### Account Information
- **Member Since** - Account creation date
- **Email Verification Status** - Shows if email is verified
- **Profile Avatar** - Displays first letter of name or email

### Actions
- **Edit Profile** - Update first and last name
- **Save Changes** - Persist profile updates
- **Cancel Editing** - Discard unsaved changes
- **Sign Out** - Secure logout with confirmation

---

## 🎨 Design

### Layout
```
┌─────────────────────────┐
│  ← Profile         [  ] │  Header
├─────────────────────────┤
│                         │
│         [  A  ]         │  Avatar (100x100px)
│                         │
├─────────────────────────┤
│  Personal Information   │
│  ┌───────────────────┐ │
│  │ Email             │ │  Read-only field
│  │ user@email.com    │ │
│  └───────────────────┘ │
│  ┌───────────────────┐ │
│  │ First Name        │ │  Editable field
│  │ John              │ │
│  └───────────────────┘ │
│  ┌───────────────────┐ │
│  │ Last Name         │ │  Editable field
│  │ Doe               │ │
│  └───────────────────┘ │
│  [Cancel]  [Save]      │  Edit mode buttons
├─────────────────────────┤
│  Account                │
│  Member Since: Jan 2024 │
│  Email: ✓ Verified      │
├─────────────────────────┤
│  [Sign Out]             │  Sign out button
└─────────────────────────┘
```

### Color Scheme
- **Background**: #0f0f0f (Deep black)
- **Cards**: #1a1a1a (Charcoal)
- **Borders**: #2a2a2a (Dark gray)
- **Avatar**: #FF6B6B (Coral pink)
- **Primary Text**: #ffffff (White)
- **Secondary Text**: #999999 (Light gray)
- **Labels**: #999999 (Light gray)
- **Edit Button**: #FF6B6B (Coral pink)
- **Save Button**: #FF6B6B (Coral pink)
- **Cancel Button**: #2a2a2a (Dark gray)

---

## 📱 Navigation

### Access Profile
From **HomeFeedScreen**:
- Tap the profile icon (👤) in the top right corner
- Navigates to ProfileScreen

### Return to Home
From **ProfileScreen**:
- Tap the back arrow (←) in the top left corner
- Returns to HomeFeedScreen

---

## 🔧 Implementation

### Component Structure
```javascript
ProfileScreen
├── Header
│   ├── Back Button
│   ├── Title ("Profile")
│   └── Placeholder
├── Avatar Container
│   └── Avatar Circle (First letter)
├── Personal Info Card
│   ├── Card Header (Title + Edit button)
│   ├── Email Field (Read-only)
│   ├── First Name Field (Editable)
│   ├── Last Name Field (Editable)
│   └── Button Row (Cancel + Save)
├── Account Info Card
│   ├── Member Since
│   └── Email Verification Status
├── Sign Out Button
└── Footer (App version)
```

### State Management
```javascript
const [isEditing, setIsEditing] = useState(false);
const [firstName, setFirstName] = useState(user?.firstName || '');
const [lastName, setLastName] = useState(user?.lastName || '');
```

### Clerk Integration
```javascript
// Get user data
const { user } = useUser();

// Update user profile
await user?.update({
  firstName: firstName.trim(),
  lastName: lastName.trim(),
});

// Sign out
const { signOut } = useAuth();
await signOut();
```

---

## 🎭 User Flows

### View Profile
1. User taps profile icon in header
2. Profile screen opens
3. User sees their information
4. User can tap back to return

### Edit Profile
1. User taps "Edit" button
2. Fields become editable
3. User modifies first/last name
4. User taps "Save" to persist changes
5. Success message appears
6. Edit mode exits

### Cancel Editing
1. User is in edit mode
2. User taps "Cancel"
3. Changes are discarded
4. Fields revert to original values
5. Edit mode exits

### Sign Out
1. User taps "Sign Out" button
2. Confirmation alert appears
3. User confirms sign out
4. User is logged out
5. Sign in screen appears

---

## 🎨 Component Styles

### Avatar
```javascript
{
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: '#FF6B6B',
  shadowColor: '#FF6B6B',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.4,
  shadowRadius: 12,
}
```

### Card
```javascript
{
  backgroundColor: '#1a1a1a',
  borderRadius: 20,
  padding: 20,
  marginBottom: 20,
  borderWidth: 2,
  borderColor: '#2a2a2a',
}
```

### Input Field
```javascript
{
  backgroundColor: '#0f0f0f',
  borderRadius: 12,
  paddingVertical: 14,
  paddingHorizontal: 16,
  fontSize: 15,
  color: '#fff',
  borderWidth: 1,
  borderColor: '#2a2a2a',
}
```

### Save Button
```javascript
{
  flex: 1,
  paddingVertical: 14,
  borderRadius: 12,
  backgroundColor: '#FF6B6B',
  alignItems: 'center',
}
```

---

## 🔒 Security

### Data Protection
- Email address is read-only (managed by Clerk)
- Profile updates go through Clerk's secure API
- Sign out requires confirmation
- No sensitive data stored locally

### Validation
- First/last name trimmed before saving
- Empty values handled gracefully
- Error messages for failed updates

---

## ♿ Accessibility

### Touch Targets
- All buttons: 44px minimum height
- Profile icon: 32x32px (easily tappable)
- Back button: Large touch area

### Text Contrast
- White on dark: 21:1 (WCAG AAA) ✅
- Coral on dark: 5.8:1 (WCAG AA) ✅
- Gray on dark: 8.2:1 (WCAG AAA) ✅

### Screen Reader Support
- Semantic labels for all fields
- Clear button descriptions
- Proper heading hierarchy

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Profile photo upload
- [ ] Change password
- [ ] Email preferences
- [ ] Notification settings
- [ ] Privacy settings
- [ ] Delete account
- [ ] Theme selection (dark/light)
- [ ] Language preferences

### Advanced Features
- [ ] Two-factor authentication
- [ ] Activity log
- [ ] Connected accounts
- [ ] Export user data
- [ ] Account statistics

---

## 📊 User Data

### Clerk User Object
```javascript
{
  id: "user_xxx",
  firstName: "John",
  lastName: "Doe",
  emailAddresses: [{
    emailAddress: "john@example.com",
    verification: {
      status: "verified"
    }
  }],
  primaryEmailAddress: {
    emailAddress: "john@example.com"
  },
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

---

## 🐛 Error Handling

### Update Failures
```javascript
try {
  await user?.update({ firstName, lastName });
  Alert.alert('Success', 'Profile updated!');
} catch (error) {
  Alert.alert('Error', 'Failed to update profile');
}
```

### Sign Out Confirmation
```javascript
Alert.alert(
  'Sign Out',
  'Are you sure?',
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign Out', onPress: () => signOut() }
  ]
);
```

---

## 📱 Header Updates

### Minimal Header Design
- **Height**: 45px top padding + 10px bottom = 55px total
- **Logo**: Extra small size (14px text)
- **Profile Icon**: 32x32px circular button
- **Background**: #1a1a1a (Charcoal)
- **No rounded corners**: Flat design for maximum space

### Before vs After
```
Before:
- Height: ~95px
- Logo: 18px
- Profile: 36x36px
- Extra info: Flyer count, user email

After:
- Height: ~55px
- Logo: 14px
- Profile: 32x32px
- Clean: Just logo and profile
```

---

<div align="center">

**Profile Feature**

*Secure • Simple • User-Friendly*

</div>
