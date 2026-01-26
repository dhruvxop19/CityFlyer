# 🎨 City Flyers Logo Guide

## Logo Components

The City Flyers brand includes two logo implementations:

### 1. **LogoText** (Primary - Text-based)
Simple, elegant text logo with lightning bolt icon
- **File**: `components/LogoText.js`
- **Best for**: All screens, headers, authentication
- **Advantages**: Lightweight, no dependencies, always works

### 2. **Logo** (Advanced - SVG-based)
Vector graphic logo with gradient effects
- **File**: `components/Logo.js`
- **Best for**: Splash screens, marketing materials
- **Requires**: `react-native-svg` package

---

## LogoText Component

### Usage

```javascript
import LogoText from '../components/LogoText';

// Basic usage
<LogoText />

// With size
<LogoText size="large" />

// With color scheme
<LogoText size="medium" color="gold" />

// With custom style
<LogoText size="small" style={{ marginTop: 20 }} />
```

### Props

| Prop | Type | Default | Options | Description |
|------|------|---------|---------|-------------|
| `size` | string | `'medium'` | `'small'`, `'medium'`, `'large'`, `'xlarge'` | Logo size |
| `color` | string | `'gold'` | `'gold'`, `'white'`, `'purple'` | Color scheme |
| `style` | object | `{}` | Any ViewStyle | Custom container styles |

### Sizes

```javascript
small:  { icon: 24px, text: 16px }
medium: { icon: 48px, text: 28px }
large:  { icon: 64px, text: 36px }
xlarge: { icon: 96px, text: 48px }
```

### Color Schemes

#### Gold (Premium)
```javascript
icon:   #FFD700  // Bright gold
text:   #D4AF37  // Metallic gold
accent: #FFD700  // Bright gold
```

#### White (Light backgrounds)
```javascript
icon:   #FFFFFF  // Pure white
text:   #FFFFFF  // Pure white
accent: rgba(255, 255, 255, 0.8)  // Semi-transparent white
```

#### Purple (Brand alternative)
```javascript
icon:   #764ba2  // Deep purple
text:   #667eea  // Bright purple
accent: #764ba2  // Deep purple
```

---

## Logo Component (SVG)

### Usage

```javascript
import Logo from '../components/Logo';

// Basic usage
<Logo />

// With size and text
<Logo size="large" showText={true} />

// Icon only
<Logo size="medium" showText={false} />

// With custom style
<Logo size="xlarge" style={{ marginBottom: 20 }} />
```

### Props

| Prop | Type | Default | Options | Description |
|------|------|---------|---------|-------------|
| `size` | string | `'medium'` | `'small'`, `'medium'`, `'large'`, `'xlarge'` | Logo size |
| `showText` | boolean | `true` | `true`, `false` | Show/hide text below icon |
| `style` | object | `{}` | Any ViewStyle | Custom container styles |

### Design Elements

The SVG logo includes:
1. **Location Pin** (background) - Represents "City" and location-based features
2. **Lightning Bolt** (foreground) - Represents speed, energy, and "Flyers"
3. **Gold Gradient** - Premium metallic effect
4. **Glow Circle** - Center highlight for depth

---

## Brand Guidelines

### Logo Usage

#### ✅ DO:
- Use on dark backgrounds (#0a0a0a, #1a1a1a)
- Maintain aspect ratio
- Keep clear space around logo (minimum 20px)
- Use gold color scheme for premium feel
- Use white scheme on colored backgrounds
- Center align in most cases

#### ❌ DON'T:
- Stretch or distort the logo
- Change colors outside provided schemes
- Add effects (shadows, outlines) beyond built-in
- Place on busy backgrounds
- Use sizes smaller than 'small'
- Rotate or skew the logo

### Clear Space

Maintain minimum clear space around logo:
- **Small**: 10px all sides
- **Medium**: 20px all sides
- **Large**: 30px all sides
- **XLarge**: 40px all sides

### Backgrounds

#### Recommended Backgrounds:
- Deep black: `#0a0a0a`
- Charcoal: `#1a1a1a`
- Dark gray: `#2a2a2a`
- Pure black: `#000000`

#### Avoid:
- Light backgrounds (use white color scheme instead)
- Busy patterns
- Low contrast backgrounds
- Gradients that compete with logo

---

## Implementation Examples

### Sign In Screen
```javascript
<LogoText size="large" color="gold" style={styles.logo} />
```

### Header
```javascript
<LogoText size="small" color="white" />
```

### Splash Screen
```javascript
<Logo size="xlarge" showText={true} />
```

### Navigation Bar
```javascript
<LogoText size="small" color="purple" />
```

### Loading State
```javascript
<Logo size="medium" showText={false} />
```

---

## Logo Variations

### Full Logo (Icon + Text)
Best for: Sign in, splash screens, about pages
```javascript
<LogoText size="large" color="gold" />
```

### Icon Only
Best for: Navigation bars, small spaces, loading indicators
```javascript
<Logo size="small" showText={false} />
```

### Text Only
Best for: Headers, titles, minimal designs
```javascript
<Text style={styles.brandText}>CityFlyers</Text>
```

---

## Typography

### Logo Font Characteristics
- **Weight**: Bold (700) for "City", Extra Bold (800) for "Flyers"
- **Letter Spacing**: 1.5px for premium feel
- **Text Shadow**: Gold glow effect
- **Case**: Mixed case (CityFlyers)

### Brand Typography
```javascript
fontFamily: System default (San Francisco on iOS, Roboto on Android)
fontWeight: '700' (Bold)
letterSpacing: 1.5
color: '#D4AF37' (Gold)
```

---

## Accessibility

### Contrast Ratios
- Gold on Black: 8.2:1 (WCAG AAA) ✅
- White on Black: 21:1 (WCAG AAA) ✅
- Purple on Black: 4.8:1 (WCAG AA) ✅

### Screen Reader
Logo components include proper accessibility labels:
```javascript
accessibilityLabel="City Flyers Logo"
accessibilityRole="image"
```

---

## Export Formats

### For App
- **React Native Component** (LogoText.js, Logo.js)
- **PNG** (assets/icon.png) - 1024x1024px
- **Adaptive Icon** (assets/adaptive-icon.png)

### For Marketing
- **SVG** - Scalable vector format
- **PNG** - High resolution (2048x2048px)
- **PDF** - Print quality

---

## Color Codes

### Primary Palette
```
Gold:           #D4AF37  (RGB: 212, 175, 55)
Bright Gold:    #FFD700  (RGB: 255, 215, 0)
Dark Gold:      #B8860B  (RGB: 184, 134, 11)
Bronze:         #8B7355  (RGB: 139, 115, 85)
```

### Background Palette
```
Deep Black:     #0a0a0a  (RGB: 10, 10, 10)
Charcoal:       #1a1a1a  (RGB: 26, 26, 26)
Dark Gray:      #2a2a2a  (RGB: 42, 42, 42)
Pure Black:     #000000  (RGB: 0, 0, 0)
```

---

## Logo Evolution

### Version 1.0 (Current)
- Lightning bolt icon (⚡)
- "CityFlyers" text
- Gold color scheme
- Premium dark theme

### Future Considerations
- Animated logo for splash screen
- Seasonal variations
- Special event logos
- Dark/light mode variants

---

## Technical Specifications

### LogoText Component
- **Dependencies**: None (pure React Native)
- **File Size**: ~2KB
- **Performance**: Excellent (text-based)
- **Compatibility**: All React Native versions

### Logo Component (SVG)
- **Dependencies**: react-native-svg
- **File Size**: ~4KB
- **Performance**: Good (vector rendering)
- **Compatibility**: React Native 0.60+

---

## Quick Reference

### Most Common Usage
```javascript
// Sign In Screen
<LogoText size="large" color="gold" />

// App Header
<LogoText size="small" color="white" />

// Splash Screen
<Logo size="xlarge" showText={true} />
```

### Color Scheme Selection
- **Dark backgrounds**: Use `color="gold"`
- **Light backgrounds**: Use `color="white"`
- **Brand colors**: Use `color="purple"`

### Size Selection
- **Hero sections**: `size="xlarge"`
- **Main screens**: `size="large"`
- **Headers**: `size="medium"`
- **Navigation**: `size="small"`

---

<div align="center">

**City Flyers Brand Identity**

*Premium • Sophisticated • Trustworthy*

</div>
