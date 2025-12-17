# Calendar Extractor

Automatically extract calendar events from Gmail emails and add them to Google Calendar and Google Sheets.

## Overview

This Google Apps Script project processes emails in your Gmail account that contain calendar event information, extracts the event details (date, time, location, attendees), and automatically:
- Creates events in your Google Calendar
- Logs event details to a Google Sheet for tracking
- Marks processed emails with a label to avoid duplicates

## Features

- 🔍 Smart email parsing to extract event details
- 📅 Automatic Google Calendar event creation
- 📊 Event logging to Google Sheets
- 🏷️ Email labeling to track processed messages
- ⏰ Configurable automated triggers
- 🔧 Customizable search queries and settings

## Setup

### Prerequisites

- A Google account with access to Gmail, Google Calendar, and Google Sheets
- Basic familiarity with Google Apps Script

### Installation Steps

1. **Create a Google Sheet**
   - Go to [Google Sheets](https://sheets.google.com)
   - Create a new spreadsheet
   - Note the Spreadsheet ID from the URL (e.g., `https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit`)

2. **Create an Apps Script Project**
   - Go to [Google Apps Script](https://script.google.com)
   - Click "New Project"
   - Give your project a name (e.g., "Calendar Extractor")

3. **Add the Script Files**
   - Delete the default `Code.gs` content
   - Copy the contents of `Code.gs` from this repository
   - Click the `+` button next to "Files" and add:
     - `Config.gs` - Copy the contents from this repository
     - `Utils.gs` - Copy the contents from this repository
   - Add the `appsscript.json` manifest:
     - Click on "Project Settings" (gear icon)
     - Check "Show 'appsscript.json' manifest file"
     - Go back to "Editor" and edit `appsscript.json` with the contents from this repository

4. **Configure the Script**
   - Open `Config.gs`
   - Update the `spreadsheetId` with your Google Sheet ID
   - Customize the `searchQuery` to match your calendar-related emails
   - Adjust other settings as needed:
     - `calendarId`: Default is 'primary', or use a specific calendar ID
     - `maxEmails`: Number of emails to process per run
     - `processedLabel`: Label name for processed emails

5. **Initialize the Spreadsheet**
   - In the Apps Script editor, select `initializeSheet` from the function dropdown
   - Click "Run"
   - Grant the necessary permissions when prompted
   - This will add headers to your Google Sheet

6. **Set Up Automated Trigger (Optional)**
   - In the Apps Script editor, select `createTrigger` from the function dropdown
   - Click "Run"
   - This will create a trigger to run `processCalendarEmails` every hour

## Usage

### Manual Execution

1. Open your Apps Script project
2. Select `processCalendarEmails` from the function dropdown
3. Click "Run"
4. Check the "Execution log" to see the results

### Automated Execution

Once you've set up the trigger (see step 6 above), the script will automatically run every hour to process new calendar-related emails.

### Customizing Email Search

Edit the `searchQuery` in `Config.gs` to match your specific needs:

```javascript
// Examples:
searchQuery: 'subject:(meeting OR event OR appointment) -label:calendar-processed'
searchQuery: 'from:calendar@example.com -label:calendar-processed'
searchQuery: 'has:attachment filename:ics -label:calendar-processed'
```

### Viewing Logs

- **Apps Script Logs**: In the editor, go to "View" > "Logs" or "Executions"
- **Google Sheet**: Check your spreadsheet for logged events
- **Calendar**: View your Google Calendar for created events

## Configuration Options

| Setting | Description | Default |
|---------|-------------|---------|
| `searchQuery` | Gmail search query to find calendar emails | `subject:(meeting OR event OR appointment) -label:calendar-processed` |
| `maxEmails` | Maximum emails to process per run | `50` |
| `calendarId` | Target Google Calendar ID | `'primary'` |
| `spreadsheetId` | Google Sheets ID for logging | `'YOUR_SPREADSHEET_ID_HERE'` |
| `processedLabel` | Label for processed emails | `'calendar-processed'` |

## Script Files

- **Code.gs**: Main script with core functionality
  - `processCalendarEmails()`: Main function to process emails
  - `extractEventDetails()`: Parse email content for event information
  - `addToCalendar()`: Create calendar events
  - `logToSheet()`: Log events to spreadsheet
  
- **Config.gs**: Configuration settings
  - `getConfig()`: Returns configuration object
  - `updateConfig()`: Update settings programmatically
  
- **Utils.gs**: Utility functions
  - `extractDateTime()`: Parse dates and times from text
  - `extractLocation()`: Find location information
  - `extractDescription()`: Extract event descriptions
  - `extractAttendees()`: Get attendee email addresses

- **appsscript.json**: Project manifest with OAuth scopes

## Troubleshooting

### No events are being created
- Check that your `searchQuery` matches actual emails in your inbox
- Verify the `spreadsheetId` is correct in `Config.gs`
- Review the execution logs for error messages

### Date/time parsing issues
- The script uses various patterns to detect dates and times
- Ensure emails contain dates in recognizable formats (e.g., "January 15, 2025 at 2:30 PM")
- Check the logs to see if dates are being extracted

### Permission errors
- Ensure you've granted all necessary OAuth permissions
- Re-run the authorization flow if needed

### Duplicate events
- The script labels processed emails to avoid duplicates
- Verify the label is being applied correctly
- Check if the same email is matching the search query multiple times

## Development

### Using clasp (Command Line)

You can use [clasp](https://github.com/google/clasp) to develop locally:

```bash
# Install clasp
npm install -g @google/clasp

# Login
clasp login

# Clone this project
clasp clone YOUR_SCRIPT_ID

# Push changes
clasp push

# Pull changes
clasp pull
```

### Testing

Test the script with sample emails:
1. Send yourself test emails with calendar information
2. Run `processCalendarEmails()` manually
3. Check logs and verify events are created correctly

## License

This project is open source and available for personal and commercial use.

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/Bodhi1111/calendar-extractor).
