# Browser Extension Installation Guide

## How to Install Career AutoFill Assistant Extension

### Step 1: Enable Developer Mode in Chrome
1. Open Google Chrome
2. Go to `chrome://extensions/`
3. Turn ON "Developer mode" (toggle in top-right corner)

### Step 2: Load the Extension
1. Click "Load unpacked"
2. Navigate to and select the `browser-extension` folder
3. The extension should now appear in your extensions list

### Step 3: Pin the Extension
1. Click the puzzle piece icon (🧩) in Chrome toolbar
2. Find "Career AutoFill Assistant" 
3. Click the pin icon to pin it to your toolbar

## How to Use the Extension

### Setup (One-time)
1. Start your backend server: `python backend/main.py`
2. Start your frontend: `npm start` (in frontend folder)
3. Upload your resume through the web dashboard (http://localhost:3000)

### Using AutoFill on Job Sites
1. **Visit any job application website** (LinkedIn, Naukri, company career pages)
2. **Click the extension icon** in your toolbar
3. **Click "Auto-Fill All Fields"** - The extension will:
   - Detect form fields on the page
   - Match them with your resume data
   - Fill them automatically with your information

### Supported Websites
- ✅ LinkedIn (Easy Apply)
- ✅ Naukri.com
- ✅ Indeed
- ✅ Company career pages
- ✅ Any website with standard HTML forms

### Supported Fields
- 📝 **Personal Info**: Name, Email, Phone
- 🎓 **Education**: University, Degree, GPA
- 💼 **Experience**: Work history, roles
- 🛠️ **Skills**: Technical skills list
- 📋 **Cover Letters**: AI-generated cover letters
- 📄 **Resume Text**: Resume summaries

## Features

### 🤖 Smart Field Detection
- Automatically detects form fields on any webpage
- Intelligently matches fields to your resume data
- Shows confidence scores for each match

### ⚡ One-Click Autofill
- Fill entire forms with one click
- Visual feedback for filled fields
- Typing simulation for better compatibility

### 🎯 Context-Aware Suggestions
- Generates custom cover letters for each application
- Adapts content based on job requirements
- Maintains professional tone

### 🔒 Privacy & Security
- All data stays on your local machine
- No data sent to external servers
- Resume data stored securely in browser

## Troubleshooting

### Extension Not Working?
1. **Check Backend**: Make sure `python backend/main.py` is running
2. **Check Connection**: Extension popup should show "✅ Connected to backend"
3. **Refresh Page**: Reload the job application page
4. **Check Console**: Open browser DevTools for error messages

### No Fields Detected?
1. **Wait for Page Load**: Give the page a few seconds to fully load
2. **Click Refresh Fields**: Use the refresh button in extension popup
3. **Check Field Types**: Some custom form elements may not be detected

### AutoFill Not Working?
1. **Upload Resume First**: Make sure you've uploaded your resume via the dashboard
2. **Check Field Match**: Some fields may not have matching data in your resume
3. **Manual Fill**: You can copy suggestions and paste manually

## Development

### File Structure
```
browser-extension/
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup interface
├── popup.js           # Popup logic
├── content.js         # Page interaction script
├── background.js      # Background service worker
└── icons/            # Extension icons
```

### Customization
- Edit `popup.html` for UI changes
- Modify `content.js` for field detection logic
- Update `popup.js` for new features

## Support

For issues or questions:
- Check the browser console for errors
- Verify backend is running on http://localhost:8000
- Ensure frontend is accessible at http://localhost:3000

Built by **Aditya Tayal** | IIT Mandi CSE
