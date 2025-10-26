# CREATE PWA ICONS

The project needs PNG icons for iOS PWA support.

## Quick Fix (2 minutes):

### Option 1: Use Online Generator
1. Go to: https://www.pwabuilder.com/imageGenerator
2. Upload any square image (logo, photo, etc.)
3. Click "Generate"
4. Download ZIP
5. Extract and copy:
   - `icon-192.png` → Rename to `icon-192x192.png`
   - `icon-512.png` → Rename to `icon-512x512.png`
6. Place both files in the `public/` folder

### Option 2: Use Placeholder Service
1. Download these two images:
   - https://via.placeholder.com/192/000000/FFFFFF.png?text=N
   - https://via.placeholder.com/512/000000/FFFFFF.png?text=N
2. Save as `icon-192x192.png` and `icon-512x512.png`
3. Place in `public/` folder

### Option 3: Design in Canva
1. Go to https://www.canva.com
2. Create 512x512px design
3. Black background, white "N" or logo
4. Download as PNG
5. Resize to 192x192 for second icon
6. Place both in `public/` folder

## Why PNG is Required:
- iOS PWA requires PNG format (SVG doesn't work)
- Need both 192x192 and 512x512 sizes
- Icons appear on iPhone home screen

## Once Created:
The app will work as a proper iOS PWA with fullscreen mode!
