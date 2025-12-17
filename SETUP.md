# Quick Setup Guide

## Prerequisites

- Google Account with Gmail, Calendar, and Sheets access
- HubSpot notifications sending to your Gmail
- Google Apps Script access

## Step-by-Step Setup (15 minutes)

### Step 1: Prepare Gmail Labels (2 min)

1. Open Gmail
2. Create two labels:
   - `HS-Booked`
   - `HS-Canceled`

### Step 2: Create Gmail Filters (5 min)

**Filter 1 - Booking Notifications:**

1. Gmail → Settings → Filters and Blocked Addresses → Create a new filter
2. Enter criteria:
   ```
   From: noreply@hubspot.com
   Subject: You've been booked
   ```
3. Click "Create filter"
4. Check "Apply the label: HS-Booked"
5. Check "Also apply filter to matching conversations" (optional - for existing emails)
6. Click "Create filter"

**Filter 2 - Cancellation Notifications:**

1. Create another filter
2. Enter criteria:
   ```
   From: noreply@hubspot.com
   Subject: canceled a meeting
   ```
3. Click "Create filter"
4. Check "Apply the label: HS-Canceled"
5. Check "Also apply filter to matching conversations" (optional)
6. Click "Create filter"

### Step 3: Prepare Google Sheet (3 min)

1. Open your lead tracking Google Sheet
2. Note the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```
3. Ensure it has a tab named `Sheet2` (or note your tab name)
4. Verify header row contains these columns (in order):
   ```
   A: Deal_ID
   B: Date
   C: Lead Last Name
   D: Lead First Name
   E: Phone Number
   F: Email Address
   G: Stage
   H: Fathom Link
   I: Demo duration
   J: Objection
   K: Reason
   L: Suggested Rebuttal
   M: Motivation
   N: Payment
   O: Deposit
   P: State
   ```

### Step 4: Deploy Script (3 min)

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Delete default code
4. Copy entire contents of `Code.gs` from this repo
5. Paste into the script editor
6. Update these lines with your info:
   ```javascript
   const SHEET_ID = 'YOUR_SHEET_ID_HERE';  // Line 179
   const SHEET_NAME = 'Sheet2';             // Line 180 (if different)
   ```
7. File → Save (or Ctrl+S)
8. Name your project (e.g., "HubSpot Calendar Sync")

### Step 5: Authorize Script (2 min)

1. Select function: `syncHubSpotMeetings`
2. Click "Run"
3. Click "Review permissions"
4. Choose your Google account
5. Click "Advanced" → "Go to [Project Name] (unsafe)"
6. Click "Allow"
7. Check Execution log for success/errors

### Step 6: Set Up Automation (2 min)

1. Click "Triggers" icon (clock) in left sidebar
2. Click "+ Add Trigger"
3. Configure:
   - **Choose function**: `syncHubSpotMeetings`
   - **Event source**: Time-driven
   - **Type of time based trigger**: Minutes timer
   - **Select minute interval**: Every 5 minutes
4. Click "Save"

### Step 7: Test (Optional - 5 min)

**Test with existing email:**

1. Find a HubSpot booking email in Gmail
2. Manually add `HS-Booked` label
3. Run `syncHubSpotMeetings` function manually
4. Verify:
   - Calendar event created
   - Lead added to sheet
   - Email labeled `HS-Processed`

**Backfill historical data:**

1. Select function: `backfillHistoricalBookings`
2. Click "Run"
3. Check Execution log for progress
4. Verify sheet has historical leads

## Verification Checklist

- [ ] Gmail labels created: `HS-Booked`, `HS-Canceled`
- [ ] Gmail filters active and directing emails correctly
- [ ] Google Sheet ID updated in script
- [ ] Script authorized with all permissions
- [ ] Time-based trigger running every 5 minutes
- [ ] Test email processed successfully
- [ ] Calendar event created from test
- [ ] Sheet row added from test

## Next Steps

1. Monitor execution logs for first 24 hours
2. Verify calendar events match incoming bookings
3. Check sheet data for accuracy
4. Run backfill if needed for historical data

## Common Issues

**"Label not found"**
- Create Gmail labels manually: HS-Booked and HS-Canceled

**"Sheet not found"**
- Verify Sheet ID is correct
- Check sheet tab name matches SHEET_NAME constant

**"Permission denied"**
- Re-run authorization process
- Check Google account has necessary permissions

**No events being created**
- Verify Gmail filter is applying label correctly
- Check trigger is running (View → Executions)
- Review logs for parsing errors

## Support

Check the main README.md for detailed documentation and troubleshooting.
