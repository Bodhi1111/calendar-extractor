# Calendar Extractor - Detailed Setup Guide

This guide provides step-by-step instructions for setting up the Calendar Extractor.

## Quick Start

### 1. Create Google Sheet

1. Go to https://sheets.google.com
2. Click "Blank" to create a new spreadsheet
3. Name it "Calendar Events Log"
4. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/1abc123xyz789_SPREADSHEET_ID_xyz/edit
   ```
   The ID is the long string between `/d/` and `/edit`

### 2. Create Apps Script Project

1. Go to https://script.google.com
2. Click "+ New project"
3. Name your project "Calendar Extractor"

### 3. Add Code Files

#### Method A: Manual Copy-Paste

1. **Replace Code.gs:**
   - In the Apps Script editor, you'll see a default `Code.gs` file
   - Delete all existing content
   - Copy the entire contents of `Code.gs` from this repository
   - Paste into the editor
   - Save (Ctrl+S or Cmd+S)

2. **Add Config.gs:**
   - Click the `+` button next to "Files"
   - Select "Script"
   - Name it `Config`
   - Copy contents of `Config.gs` from repository
   - Paste and save

3. **Add Utils.gs:**
   - Click the `+` button next to "Files"
   - Select "Script"
   - Name it `Utils`
   - Copy contents of `Utils.gs` from repository
   - Paste and save

4. **Add appsscript.json:**
   - Click the gear icon (Project Settings)
   - Check "Show 'appsscript.json' manifest file in editor"
   - Go back to Editor tab
   - Click on `appsscript.json` in the file list
   - Replace its contents with `appsscript.json` from repository
   - Save

#### Method B: Using clasp (Advanced)

If you prefer command-line tools:

```bash
# Install clasp globally
npm install -g @google/clasp

# Enable Apps Script API at https://script.google.com/home/usersettings

# Login to Google
clasp login

# Create new project
clasp create --type standalone --title "Calendar Extractor"

# Copy files to your local directory
# Then push to Apps Script
clasp push
```

### 4. Configure Settings

1. Open `Config.gs` in the editor
2. Find the line: `spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE',`
3. Replace `YOUR_SPREADSHEET_ID_HERE` with your actual Spreadsheet ID from step 1
4. Example:
   ```javascript
   spreadsheetId: '1abc123xyz789_SPREADSHEET_ID_xyz',
   ```
5. Save the file

### 5. Grant Permissions

1. In the toolbar, select `initializeSheet` from the function dropdown
2. Click the "Run" button (▶️)
3. A dialog will appear: "Authorization required"
4. Click "Review permissions"
5. Choose your Google account
6. Click "Advanced" (if you see a warning)
7. Click "Go to Calendar Extractor (unsafe)"
8. Click "Allow"

**Note:** The script needs these permissions:
- Read Gmail messages
- Modify Gmail labels
- Access Google Calendar
- Access Google Sheets
- Manage script triggers

### 6. Initialize Spreadsheet

After granting permissions, the `initializeSheet` function will run and add headers to your Google Sheet:
- Timestamp
- Event Title
- Start Time
- End Time
- Location
- Description
- Attendees
- Calendar Event ID
- Source Email ID

Check your spreadsheet to confirm headers were added.

### 7. Test Manual Run

1. Select `processCalendarEmails` from the function dropdown
2. Click "Run"
3. Check "Execution log" (View > Logs) to see results
4. If you have matching emails, events will be created

### 8. Set Up Automated Trigger (Optional)

1. Select `createTrigger` from the function dropdown
2. Click "Run"
3. This creates a time-based trigger to run every hour

To verify the trigger:
1. Click the clock icon (Triggers) in the left sidebar
2. You should see an entry for `processCalendarEmails`

## Customization

### Modify Search Query

The default search query looks for emails with "meeting", "event", or "appointment" in the subject:

```javascript
searchQuery: 'subject:(meeting OR event OR appointment) -label:calendar-processed'
```

**Examples of custom queries:**

Find emails from specific sender:
```javascript
searchQuery: 'from:calendar@company.com -label:calendar-processed'
```

Find emails with calendar attachments:
```javascript
searchQuery: 'has:attachment filename:ics -label:calendar-processed'
```

Find emails in specific category:
```javascript
searchQuery: 'category:promotions subject:webinar -label:calendar-processed'
```

Combine multiple criteria:
```javascript
searchQuery: '(from:events@meetup.com OR from:calendar@company.com) subject:invitation -label:calendar-processed'
```

### Use Different Calendar

To add events to a specific calendar instead of your primary calendar:

1. Open Google Calendar
2. Find the calendar in the left sidebar
3. Click the three dots next to it
4. Select "Settings and sharing"
5. Scroll to "Integrate calendar"
6. Copy the "Calendar ID"
7. Update `Config.gs`:
   ```javascript
   calendarId: 'your-calendar-id@group.calendar.google.com',
   ```

### Change Trigger Frequency

To run more or less frequently than every hour:

Edit the `createTrigger()` function in `Code.gs`:

```javascript
// Run every 30 minutes
ScriptApp.newTrigger('processCalendarEmails')
  .timeBased()
  .everyMinutes(30)
  .create();

// Run every 6 hours
ScriptApp.newTrigger('processCalendarEmails')
  .timeBased()
  .everyHours(6)
  .create();

// Run daily at 9 AM
ScriptApp.newTrigger('processCalendarEmails')
  .timeBased()
  .atHour(9)
  .everyDays(1)
  .create();
```

## Verification Steps

### Check Logs

View execution logs:
1. Click "Executions" in left sidebar
2. Click on a recent execution
3. View status and logs

### Check Sheet

Your Google Sheet should show:
- Headers in row 1 (bold)
- One row per processed event
- Timestamp of when it was added

### Check Calendar

Your Google Calendar should show:
- New events created from emails
- Event details match email content

### Check Gmail

Processed emails should have:
- Label "calendar-processed" (or your custom label)
- This prevents duplicate processing

## Troubleshooting

### "Cannot read property 'appendRow' of null"

**Problem:** Spreadsheet ID is incorrect or sheet doesn't exist

**Solution:**
1. Verify Spreadsheet ID in Config.gs
2. Ensure you can access the spreadsheet
3. Run `initializeSheet` again

### "Calendar not found"

**Problem:** Calendar ID is incorrect

**Solution:**
1. Use `'primary'` for default calendar
2. Verify custom calendar ID if using specific calendar
3. Ensure calendar exists and is accessible

### "No events found"

**Problem:** No emails match search query

**Solution:**
1. Test search query in Gmail directly
2. Remove `-label:calendar-processed` temporarily to see all matches
3. Adjust query to match your emails
4. Send yourself a test email

### "Rate limit exceeded"

**Problem:** Too many API calls

**Solution:**
1. Reduce `maxEmails` in Config.gs
2. Reduce trigger frequency
3. Wait a few minutes and try again

### Date/time not parsing correctly

**Problem:** Email format not recognized

**Solution:**
1. Check email content format
2. Add custom patterns to `extractDateTime` in Utils.gs
3. Test with different email formats
4. Review logs to see what was extracted

## Advanced Configuration

### Using Script Properties

For dynamic configuration without editing code:

```javascript
// Set configuration via script console
function setConfig() {
  updateConfig({
    spreadsheetId: 'your-new-spreadsheet-id',
    calendarId: 'your-calendar-id',
    searchQuery: 'your custom query'
  });
}
```

Then modify `getConfig()` to use `getConfigFromProperties()`:

```javascript
function getConfig() {
  return getConfigFromProperties();
}
```

### Multiple Calendars

To route events to different calendars based on email criteria:

```javascript
function getTargetCalendar(eventDetails, message) {
  const from = message.getFrom();
  
  if (from.includes('work@company.com')) {
    return 'work-calendar-id@group.calendar.google.com';
  } else if (from.includes('personal')) {
    return 'primary';
  }
  
  return 'primary';
}
```

## Support Resources

- **Gmail Search Syntax:** https://support.google.com/mail/answer/7190
- **Apps Script Documentation:** https://developers.google.com/apps-script
- **Calendar API:** https://developers.google.com/apps-script/reference/calendar
- **Sheets API:** https://developers.google.com/apps-script/reference/spreadsheet

## Next Steps

1. ✅ Complete setup following this guide
2. ✅ Test with sample emails
3. ✅ Customize search query for your needs
4. ✅ Set up automated trigger
5. ✅ Monitor logs and verify events
6. 🎉 Enjoy automated calendar management!
