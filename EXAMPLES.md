# Calendar Extractor - Examples

This document provides examples of email formats that the Calendar Extractor can parse, along with sample outputs.

## Example Email Formats

### Example 1: Basic Meeting Invitation

**Email Subject:** Team Meeting - Q1 Planning

**Email Body:**
```
Hi Team,

We have a meeting scheduled for Q1 planning.

Date: January 15, 2025
Time: 2:30 PM
Location: Conference Room A
Duration: 1 hour

Please review the Q1 objectives before the meeting.

Best regards,
John
```

**Extracted Event:**
- Title: Team Meeting - Q1 Planning
- Start Time: January 15, 2025 2:30 PM
- End Time: January 15, 2025 3:30 PM
- Location: Conference Room A
- Description: Hi Team, We have a meeting scheduled for Q1 planning...

### Example 2: Event with ISO Date Format

**Email Subject:** Product Launch Event

**Email Body:**
```
Product Launch Event

When: 2025-02-20 14:00:00
Where: Main Auditorium, Building 3
Duration: 2 hours

Join us for the exciting launch of our new product line.

Agenda:
- Product overview
- Demo session
- Q&A

Contact: events@company.com
```

**Extracted Event:**
- Title: Product Launch Event
- Start Time: February 20, 2025 2:00 PM
- End Time: February 20, 2025 4:00 PM
- Location: Main Auditorium, Building 3
- Attendees: events@company.com

### Example 3: Short Format

**Email Subject:** Lunch Meeting

**Email Body:**
```
Let's meet for lunch!

Date: Jan 18, 2025 12:30 PM
Place: The Garden Cafe
```

**Extracted Event:**
- Title: Lunch Meeting
- Start Time: January 18, 2025 12:30 PM
- End Time: January 18, 2025 1:30 PM
- Location: The Garden Cafe

### Example 4: Workshop Invitation

**Email Subject:** JavaScript Workshop - Advanced Techniques

**Email Body:**
```
You're invited to our JavaScript Workshop!

Date: March 5, 2025
Time: 10:00 AM - 3:00 PM
Venue: Tech Hub, Room 201
Address: 123 Innovation Drive, Tech City

Topics covered:
- Async/await patterns
- Performance optimization
- Modern frameworks

Please bring your laptop.

RSVP: workshop@techcommunity.org
```

**Extracted Event:**
- Title: JavaScript Workshop - Advanced Techniques
- Start Time: March 5, 2025 10:00 AM
- End Time: March 5, 2025 3:00 PM
- Location: Tech Hub, Room 201

### Example 5: Appointment Reminder

**Email Subject:** Appointment Reminder - Dr. Smith

**Email Body:**
```
Appointment Reminder

Patient: John Doe
Doctor: Dr. Smith
Date: 01/22/2025 15:30
Location: Medical Center, Suite 4B

Please arrive 15 minutes early.
```

**Extracted Event:**
- Title: Appointment Reminder - Dr. Smith
- Start Time: January 22, 2025 3:30 PM
- End Time: January 22, 2025 4:30 PM
- Location: Medical Center, Suite 4B

## Testing the Script

### Test Email Template

Send this email to yourself to test the script:

**Subject:** Test Meeting - Calendar Extractor

**Body:**
```
This is a test email for the Calendar Extractor.

Meeting Details:
Date: [Tomorrow's date]
Time: 3:00 PM
Location: Virtual Meeting Room
Duration: 30 minutes

This meeting is to test the automated calendar extraction.
```

### Search Query Examples

Test different search queries to find specific types of calendar emails:

#### Find all meeting invitations:
```javascript
searchQuery: 'subject:(meeting OR invitation) -label:calendar-processed'
```

#### Find webinar registrations:
```javascript
searchQuery: 'subject:webinar has:attachment -label:calendar-processed'
```

#### Find events from specific domain:
```javascript
searchQuery: 'from:@eventbrite.com subject:(event OR ticket) -label:calendar-processed'
```

#### Find recent unprocessed emails:
```javascript
searchQuery: 'newer_than:7d subject:(meeting OR event OR appointment) -label:calendar-processed'
```

## Common Date/Time Formats Supported

The script recognizes various date and time formats:

### Date Formats:
- `2025-01-15` (ISO format)
- `January 15, 2025` (Full month name)
- `Jan 15, 2025` (Short month name)
- `01/15/2025` (US format)
- `15-01-2025` (International format)

### Time Formats:
- `14:30` (24-hour)
- `2:30 PM` (12-hour with AM/PM)
- `14:30:00` (With seconds)
- `2:30:00 PM` (12-hour with seconds)

### Combined Formats:
- `2025-01-15T14:30:00` (ISO 8601)
- `January 15, 2025 at 2:30 PM`
- `Jan 15, 2025 2:30 PM`
- `01/15/2025 14:30`
- `15-01-2025 14:30`

## Location Patterns

The script can extract locations from various patterns:

- `Location: Conference Room A`
- `Where: Building 3, Floor 2`
- `Venue: Grand Hotel`
- `Place: Central Park`
- `Address: 123 Main Street`
- `At The Coffee Shop on Main Street`
- `Room B204`

## Customizing Parsing

### Add Custom Date Pattern

If your emails use a specific date format not recognized, add it to `Utils.gs`:

```javascript
// Add to the patterns array in extractDateTime()
/Your custom pattern here/i,
```

Example for "15th of January 2025":
```javascript
/(\d{1,2})(?:st|nd|rd|th)\s+of\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i,
```

### Add Custom Location Pattern

Add custom patterns to `extractLocation()` in `Utils.gs`:

```javascript
/meeting room:\s*([^\n]+)/i,
/online:\s*([^\n]+)/i,
```

## Expected Output in Google Sheets

Each processed email creates a row with these columns:

| Timestamp | Event Title | Start Time | End Time | Location | Description | Attendees | Calendar Event ID | Source Email ID |
|-----------|-------------|------------|----------|----------|-------------|-----------|-------------------|-----------------|
| 2025-01-17 10:30:15 | Team Meeting | 2025-01-15 14:30:00 | 2025-01-15 15:30:00 | Room A | Hi Team, We have... | john@company.com | abc123xyz | msg_123456 |

## Expected Output in Google Calendar

Each event will appear in your calendar with:
- **Title:** From email subject
- **Time:** Extracted start and end times
- **Location:** Extracted location
- **Description:** Email body (cleaned and truncated)
- **Guests:** Sender and CC recipients (invites not sent)
- **Color:** Default calendar color

## Error Scenarios

### Email with no date/time:

**Email:**
```
Subject: Important Meeting

Let's schedule a meeting soon.
```

**Result:** Event not created (no date/time found), logged in execution log

### Email with ambiguous date:

**Email:**
```
Subject: Team Sync

Meeting next Tuesday at 2pm
```

**Result:** May fail to parse "next Tuesday" - use absolute dates

### Email with multiple dates:

**Email:**
```
Subject: Conference Schedule

Day 1: January 15, 2025 9:00 AM
Day 2: January 16, 2025 9:00 AM
```

**Result:** First date is extracted (January 15, 2025 9:00 AM)

## Best Practices for Email Formatting

To ensure reliable parsing:

1. ✅ Use explicit date formats: "January 15, 2025" or "2025-01-15"
2. ✅ Include clear time indicators: "2:30 PM" or "14:30"
3. ✅ Use location labels: "Location:", "Where:", "Venue:"
4. ✅ Keep event details near the top of the email
5. ❌ Avoid relative dates: "next week", "tomorrow"
6. ❌ Avoid ambiguous times: "afternoon", "morning"

## Integration Examples

### Meetup.com Events

Meetup sends calendar-ready emails. Use this query:
```javascript
searchQuery: 'from:info@meetup.com subject:reminder -label:calendar-processed'
```

### Eventbrite Tickets

Eventbrite confirmation emails work well:
```javascript
searchQuery: 'from:@eventbrite.com subject:(order OR ticket) -label:calendar-processed'
```

### Microsoft Teams Invites

Teams meeting invites (when forwarded to Gmail):
```javascript
searchQuery: 'subject:"Microsoft Teams meeting" -label:calendar-processed'
```

### Zoom Invites

Zoom meeting invitations:
```javascript
searchQuery: 'from:no-reply@zoom.us subject:invitation -label:calendar-processed'
```

## Debugging Tips

### View extracted data:

Temporarily add logging to see what's extracted:

```javascript
// In extractEventDetails()
Logger.log('Extracted date/time: ' + event.startTime);
Logger.log('Extracted location: ' + event.location);
```

### Test individual functions:

```javascript
function testExtraction() {
  const testBody = "Meeting on January 15, 2025 at 2:30 PM in Room A";
  const date = extractDateTime(testBody, "");
  Logger.log('Parsed date: ' + date);
}
```

### Check Gmail search:

Run your search query directly in Gmail to see which emails match:
1. Go to Gmail
2. Paste your search query in the search box
3. Verify the results are what you expect

## Performance Notes

- Processing 50 emails takes approximately 30-60 seconds
- Calendar API allows 5,000 requests per day per user
- Sheets API allows 500 requests per 100 seconds per project
- Gmail API quota depends on account type

For high-volume processing:
1. Reduce `maxEmails` per run
2. Increase trigger interval
3. Use specific search queries to limit results
4. Monitor quota usage in Apps Script dashboard
