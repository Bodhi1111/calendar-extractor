# Quick Start Guide

Get started with Calendar Extractor in 5 minutes!

## Prerequisites

- Google account
- Access to Gmail, Google Calendar, and Google Sheets

## 5-Minute Setup

### Step 1: Create a Google Sheet (1 min)

1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit`

### Step 2: Create Apps Script Project (1 min)

1. Go to [script.google.com](https://script.google.com)
2. Click "+ New project"
3. Name it "Calendar Extractor"

### Step 3: Add the Code (2 min)

1. **Replace Code.gs:**
   - Delete the default content
   - Copy and paste `Code.gs` from this repository

2. **Add Config.gs:**
   - Click the `+` next to "Files" → "Script"
   - Name it "Config"
   - Copy and paste `Config.gs` from this repository
   - **IMPORTANT:** Update line with `spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE'` with your actual ID

3. **Add Utils.gs:**
   - Click the `+` next to "Files" → "Script"
   - Name it "Utils"
   - Copy and paste `Utils.gs` from this repository

4. **Add appsscript.json:**
   - Click Project Settings (gear icon)
   - Check "Show 'appsscript.json' manifest file"
   - Go back to Editor
   - Click `appsscript.json`
   - Replace content with `appsscript.json` from this repository

### Step 4: Initialize & Test (1 min)

1. **Grant Permissions:**
   - Select `initializeSheet` from function dropdown
   - Click Run ▶️
   - Click "Review permissions" → Choose account → "Allow"

2. **Test:**
   - Select `processCalendarEmails` from function dropdown
   - Click Run ▶️
   - Check View → Logs for results

### Step 5: Automate (Optional, 30 seconds)

1. Select `createTrigger` from function dropdown
2. Click Run ▶️
3. Done! Now runs automatically every hour

## What It Does

📧 **Finds emails** matching: `subject:(meeting OR event OR appointment)`

📅 **Creates calendar events** in your Google Calendar

📊 **Logs to spreadsheet** with full event details

🏷️ **Labels processed emails** to avoid duplicates

## Customization

### Change Email Search

Edit in `Config.gs`:

```javascript
searchQuery: 'your custom query here'
```

Examples:
- `'from:calendar@company.com'` - From specific sender
- `'subject:webinar'` - Webinars only
- `'has:attachment filename:ics'` - With calendar files

### Use Different Calendar

Edit in `Config.gs`:

```javascript
calendarId: 'your-calendar-id@group.calendar.google.com'
```

Get Calendar ID: Calendar Settings → Integrate calendar → Calendar ID

## Common Issues

**"Cannot read property of null"**
→ Check spreadsheetId in Config.gs

**"No events created"**
→ Verify your Gmail has matching emails

**"Permission denied"**
→ Re-run initializeSheet and grant all permissions

## Files Structure

```
calendar-extractor/
├── Code.gs              # Main script ⭐ Start here
├── Config.gs            # Settings ⚙️ Edit your spreadsheet ID
├── Utils.gs             # Helper functions
├── appsscript.json      # Project manifest
├── README.md            # Full documentation
├── SETUP_GUIDE.md       # Detailed setup
├── EXAMPLES.md          # Email examples
└── QUICK_START.md       # This file
```

## Next Steps

✅ Working? Great! You're done.

Want more? Check:
- 📖 **README.md** - Full documentation
- 📋 **SETUP_GUIDE.md** - Detailed instructions  
- 📧 **EXAMPLES.md** - Email format examples

## Need Help?

1. Check execution logs: View → Logs
2. Review SETUP_GUIDE.md troubleshooting section
3. Test your search query directly in Gmail
4. Open an issue on GitHub

---

**⏱️ Time to value: 5 minutes**

**🚀 Automated calendar management starts now!**
