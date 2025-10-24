# Email Guard Icons

This folder should contain the extension icons in the following sizes:

- **icon16.png** - 16x16 pixels (toolbar icon, small)
- **icon32.png** - 32x32 pixels (toolbar icon, medium)
- **icon48.png** - 48x48 pixels (extension management)
- **icon128.png** - 128x128 pixels (Chrome Web Store, installation)

## How to Generate Icons

### Option 1: Use the Icon Generator (Easiest)

1. Open `create-icons.html` (in the parent directory) in your browser
2. Click "Download All Icons"
3. Save the downloaded PNG files to this folder with the correct names

### Option 2: Create Custom Icons

Use design software like:
- **Figma** (free, web-based)
- **Adobe Illustrator** (professional)
- **Inkscape** (free, open-source)
- **Canva** (free, easy to use)

**Design Guidelines:**
- Use a shield or lock symbol to represent security
- Primary colors: Purple gradient (#667eea to #764ba2)
- Keep design simple and recognizable at small sizes
- Ensure good contrast for visibility
- Test at all sizes (especially 16x16)

**Recommended Design:**
- Shield shape with checkmark
- White shield on purple gradient background
- Clean, modern style
- Scalable vector design

### Option 3: Hire a Designer

For professional icons:
- Fiverr (budget-friendly)
- Upwork (professional)
- 99designs (design contest)
- Dribbble (find designers)

**Brief for Designer:**
```
Extension Name: Email Guard
Purpose: Email security and phishing protection
Style: Modern, professional, trustworthy
Symbol: Shield with checkmark or lock
Colors: Purple gradient (#667eea to #764ba2), white
Sizes needed: 16x16, 32x32, 48x48, 128x128 PNG
```

## Temporary Solution

If you need to test the extension immediately without custom icons:

1. Use the icon generator (`create-icons.html`)
2. The generated icons are simple but functional
3. Replace with professional icons later

## Icon Requirements

- **Format**: PNG with transparency
- **Color Mode**: RGB
- **Bit Depth**: 24-bit or 32-bit (with alpha channel)
- **Background**: Transparent or solid color
- **File Size**: Keep under 50KB per icon

## Testing Icons

After adding icons:

1. Reload the extension in `chrome://extensions/`
2. Check the toolbar icon (should show 16x16 or 32x32)
3. Check the extension management page (should show 48x48)
4. Icons should be clear and recognizable at all sizes

## Current Status

⚠️ **Icons not yet generated**

Please generate icons using one of the methods above before using the extension.

---

**Note**: The extension will still function without custom icons, but Chrome will show a default placeholder icon.
