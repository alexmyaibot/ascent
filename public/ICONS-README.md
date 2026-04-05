# App Icons for PWA

To complete the PWA setup, add these icon files to `/public/`:

## Required Files

1. **icon-192.png** (192x192)
   - App icon for home screen
   - Transparent background
   - Round or square design

2. **icon-512.png** (512x512)
   - Large app icon for splash screens
   - Transparent background
   - Same design as 192px

3. **icon-maskable-192.png** (192x192)
   - For maskable icon support (adaptive icon shape)
   - Important for iOS 15+
   - Ensure important elements are within safe zone

4. **icon-maskable-512.png** (512x512)
   - Large maskable icon
   - Ensure important elements are within safe zone

## Quick Solution

Use an online icon generator:
- https://www.favicon-generator.org/
- Upload emoji 🧗 or climbing design
- Generate PNG files
- Download and place in `/public/`

Or use a design tool like Figma:
- Create 192x192 and 512x512 artboards
- Use the emoji 🧗 or custom climbing icon
- Export as PNG with transparent background

## Icon Design Tips

- Use climbing/mountain theme (emoji 🧗 or custom)
- Keep design simple and recognizable
- Ensure good contrast for small sizes (192px)
- Use solid colors that match theme color (#10b981 - emerald green)
