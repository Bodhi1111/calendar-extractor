# HubSpot Meeting Calendar Sync

Automatically syncs HubSpot meeting notifications from Gmail to Google Calendar and logs lead information to Google Sheets.

## Features

- **Automated Meeting Sync**: Processes HubSpot booking notifications and creates Google Calendar events
- **Cancellation Handling**: Automatically deletes calendar events when meetings are canceled
- **Lead Tracking**: Logs all lead information to a Google Sheet with proper sorting
- **Backfill Support**: Import historical booking emails into the tracking sheet
- **Smart Processing**: Prevents duplicate processing with label management

## How It Works

### Gmail Label System

The script monitors two Gmail labels:
- **HS-Booked**: Contains HubSpot booking confirmation emails
- **HS-Canceled**: Contains HubSpot cancellation emails
- **HS-Processed**: Automatically created to track processed emails

### Workflow

1. **Booked Meetings** (`processBookedMeetings`):
   - Reads emails from `HS-Booked` label
   - Extracts meeting details (date, time, lead info, Zoom link)
   - Creates Google Calendar event with lead as guest
   - Logs lead data to Google Sheet
   - Marks email as processed

2. **Canceled Meetings** (`processCanceledMeetings`):
   - Reads emails from `HS-Canceled` label
   - Searches for matching calendar events
   - Deletes the canceled event
   - Marks email as processed

3. **Sheet Logging** (`writeLeadToSheet`):
   - Adds lead information with chronological sorting (newest first)
   - Creates unique Deal ID based on timestamp
   - Splits lead name into first/last names
   - Sets initial stage as "Scheduled"

## Setup Instructions

### 1. Create Gmail Filters

Create Gmail filters to automatically label HubSpot emails:

**For Bookings:**
- **From**: `noreply@hubspot.com`
- **Subject**: `You've been booked`
- **Apply Label**: `HS-Booked`

**For Cancellations:**
- **From**: `noreply@hubspot.com`
- **Subject**: `canceled a meeting`
- **Apply Label**: `HS-Canceled`

### 2. Configure Google Sheets

1. Open your Google Sheet for lead tracking
2. Note the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
3. Update the `SHEET_ID` constant in `Code.gs`:
   ```javascript
   const SHEET_ID = 'YOUR_SHEET_ID_HERE';
   ```
4. Update the `SHEET_NAME` if needed (default is `Sheet2`)

**Expected Sheet Structure:**

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Deal_ID | Date | Lead Last Name | Lead First Name | Phone Number | Email Address | Stage | Fathom Link | Demo duration | Objection | Reason | Suggested Rebuttal | Motivation | Payment | Deposit | State |

### 3. Deploy to Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Create a new project
3. Copy the contents of `Code.gs` into the script editor
4. Save the project

### 4. Set Up Trigger

1. In Google Apps Script, click **Triggers** (clock icon)
2. Click **Add Trigger**
3. Configure:
   - **Function**: `syncHubSpotMeetings`
   - **Event source**: Time-driven
   - **Type**: Minutes timer
   - **Interval**: Every 5 minutes (or as needed)
4. Save the trigger

### 5. Authorize Permissions

First run will require authorization:
1. Run `syncHubSpotMeetings` manually
2. Click **Review Permissions**
3. Select your Google account
4. Click **Advanced** → **Go to [Project Name]**
5. Click **Allow**

## Functions Reference

### Main Functions

#### `syncHubSpotMeetings()`
Main entry point - processes both booked and canceled meetings.

**Usage**: Set this as your time-based trigger function.

#### `backfillHistoricalBookings()`
One-time backfill of historical booking emails (up to 500).

**Usage**: Run manually once to import past bookings.

**Note**: Only adds to sheet; does not create calendar events.

### Processing Functions

#### `processBookedMeetings()`
Processes emails in `HS-Booked` label and creates calendar events.

#### `processCanceledMeetings()`
Processes emails in `HS-Canceled` label and deletes calendar events.

### Helper Functions

#### `parseHubSpotDateTime(dateStr)`
Parses HubSpot date format: `"December 17, 2025 10:00 AM CST (UTC -06:00)"`

**Returns**: Date object or null

#### `writeLeadToSheet(leadName, email, phone, startTime, zoomLink, meetingTitle)`
Writes lead data to Google Sheet with chronological sorting.

## Email Format Expectations

### Booking Email

**Subject**: `FW: You've been booked by: [Lead Name]`

**Body must contain**:
- `New Meeting Booked [Meeting Title]`
- `Date / time: [Date/Time]`
- `Email address: [Email]`
- `Phone number: [Phone]`
- `Location: [Zoom Link]`

### Cancellation Email

**Body must contain**:
- `canceled a meeting [Meeting Title]`
- `Originally planned date / time: [Date/Time]`

## Configuration

### Customizable Constants

```javascript
// Google Sheet Configuration
const SHEET_ID = '1dszRhBf8THlU6Tn8YvljnUtmw87RriMblp1LKPwchJ8';
const SHEET_NAME = 'Sheet2';

// Meeting Duration (in milliseconds)
const MEETING_DURATION = 60 * 60 * 1000; // 60 minutes
```

### Regex Patterns

The script uses regex to extract data from emails. If your email format changes, update these patterns:

```javascript
// Lead name from subject
/FW: You've been booked by: (.+)/

// Meeting title
/New Meeting Booked\s+([^\n]+)/

// Date/time
/Date \/ time:\s*([^\n]+)/

// Zoom link
/Location:\s*(https:\/\/[^\s]+)/

// Email address
/Email address:\s*([^\s\n]+)/

// Phone number
/Phone number:\s*([^\s\n]+)/
```

## Troubleshooting

### No emails being processed

1. Check that Gmail labels exist: `HS-Booked` and `HS-Canceled`
2. Verify Gmail filters are correctly configured
3. Check trigger is running (View → Executions)
4. Review logs (View → Logs) for errors

### Calendar events not created

1. Verify default calendar permissions
2. Check date parsing is successful in logs
3. Ensure email format matches expected patterns

### Sheet not updating

1. Verify `SHEET_ID` is correct
2. Check sheet name matches `SHEET_NAME` constant
3. Ensure script has Sheets API permissions
4. Review error logs for specific issues

### Date/Time parsing issues

- HubSpot date format must include timezone info
- Check for timezone abbreviation (CST, EST, etc.)
- Review `parseHubSpotDateTime` function logic

## Logging

All operations are logged using `Logger.log()`. View logs:

1. In Apps Script editor: **View → Logs**
2. Or use **View → Executions** for trigger runs

Key log messages:
- `Created event: [Title] on [Date]`
- `Added lead to sheet: [Name]`
- `Deleting event: [Title]`
- Processing summaries from backfill function

## Maintenance

### Regular Tasks

- Monitor execution logs for errors
- Verify sheet data accuracy weekly
- Check for stuck emails in processing labels

### Updates

When updating the script:
1. Test with a small batch first
2. Backup your Google Sheet
3. Review logs after deployment

## Security Notes

- Script requires Gmail, Calendar, and Sheets permissions
- Sensitive data (emails, phone numbers) is handled
- Consider access restrictions on Google Sheet
- Review Apps Script project sharing settings

## Future Improvements

Potential enhancements:
- [ ] Add duplicate detection in Google Sheet
- [ ] Support for recurring meetings
- [ ] Email notifications for failed processing
- [ ] Custom meeting duration based on meeting type
- [ ] Integration with CRM systems
- [ ] Lead status updates via sheet monitoring
- [ ] Better error handling and retry logic

## License

This is a custom internal tool. Modify as needed for your organization.

## Support

For issues or questions:
1. Check logs for error messages
2. Verify configuration settings
3. Review email format matches expectations
4. Test individual functions manually
