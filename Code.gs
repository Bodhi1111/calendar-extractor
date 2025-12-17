/**
 * HubSpot Meeting Calendar Sync
 * 
 * Automatically syncs HubSpot meeting notifications from Gmail to Google Calendar
 * and logs lead information to a Google Sheet.
 * 
 * Features:
 * - Processes booked meetings from HS-Booked Gmail label
 * - Processes canceled meetings from HS-Canceled Gmail label
 * - Creates Google Calendar events with meeting details
 * - Logs lead data to Google Sheets with sorting by date
 * - Backfill function for historical emails
 */

/**
 * Main synchronization function
 * Processes both booked and canceled meetings
 */
function syncHubSpotMeetings() {
  processBookedMeetings();
  processCanceledMeetings();
}

/**
 * Process booked meetings from Gmail HS-Booked label
 * Creates calendar events and logs to Google Sheet
 */
function processBookedMeetings() {
  const label = GmailApp.getUserLabelByName("HS-Booked");
  const processedLabel = GmailApp.getUserLabelByName("HS-Processed") || 
                         GmailApp.createLabel("HS-Processed");
  
  if (!label) {
    Logger.log("HS-Booked label not found");
    return;
  }
  
  const threads = label.getThreads();
  const calendar = CalendarApp.getDefaultCalendar();
  
  threads.forEach(thread => {
    if (thread.getLabels().some(l => l.getName() === "HS-Processed")) {
      return; // Skip already processed
    }
    
    const message = thread.getMessages()[0];
    const body = message.getPlainBody();
    const subject = message.getSubject();
    
    // Extract lead name from subject
    const leadMatch = subject.match(/FW: You've been booked by: (.+)/);
    const leadName = leadMatch ? leadMatch[1] : "Lead";
    
    // Extract meeting title
    const titleMatch = body.match(/New Meeting Booked\s+([^\n]+)/);
    const meetingTitle = titleMatch ? titleMatch[1].trim() : "HubSpot Meeting";
    
    // Extract date/time - format: "December 17, 2025 10:00 AM CST"
    const dateMatch = body.match(/Date \/ time:\s*([^\n]+)/);
    if (!dateMatch) {
      Logger.log("Could not parse date from: " + thread.getFirstMessageSubject());
      return;
    }
    
    const dateStr = dateMatch[1].trim();
    const startTime = parseHubSpotDateTime(dateStr);
    
    if (!startTime) {
      Logger.log("Failed to parse date: " + dateStr);
      return;
    }
    
    // Extract Zoom link
    const zoomMatch = body.match(/Location:\s*(https:\/\/[^\s]+)/);
    const zoomLink = zoomMatch ? zoomMatch[1].trim() : "";
    
    // Extract email
    const emailMatch = body.match(/Email address:\s*([^\s\n]+)/);
    let email = emailMatch ? emailMatch[1].trim() : "";
      
    // Clean up email - remove mailto: link formatting
    if (email.includes('<mailto:')) {
      email = email.split('<')[0].trim();
    }
    
    // Extract phone
    const phoneMatch = body.match(/Phone number:\s*([^\s\n]+)/);
    const phone = phoneMatch ? phoneMatch[1].trim() : "";
    
    // Default 60-minute meeting
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    
    // Create description
    const description = `HubSpot Booking\n\nLead: ${leadName}\nEmail: ${email}\nPhone: ${phone}\n\nZoom: ${zoomLink}`;
    
    // Create event
    const event = calendar.createEvent(
      meetingTitle,
      startTime,
      endTime,
      {
        description: description,
        location: zoomLink,
        guests: email
      }
    );

    // Write to Google Sheet
    writeLeadToSheet(leadName, email, phone, startTime, zoomLink, meetingTitle);
    
    Logger.log(`Created event: ${meetingTitle} on ${startTime}`);
    
    // Mark as processed
    thread.addLabel(processedLabel);
    thread.removeLabel(label);
  });
}

/**
 * Process canceled meetings from Gmail HS-Canceled label
 * Deletes corresponding calendar events
 */
function processCanceledMeetings() {
  const label = GmailApp.getUserLabelByName("HS-Canceled");
  const processedLabel = GmailApp.getUserLabelByName("HS-Processed") || 
                         GmailApp.createLabel("HS-Processed");
  
  if (!label) {
    Logger.log("HS-Canceled label not found");
    return;
  }
  
  const threads = label.getThreads();
  const calendar = CalendarApp.getDefaultCalendar();
  
  threads.forEach(thread => {
    if (thread.getLabels().some(l => l.getName() === "HS-Processed")) {
      return; // Skip already processed
    }
    
    const message = thread.getMessages()[0];
    const body = message.getPlainBody();
    
    // Extract meeting title
    const titleMatch = body.match(/canceled a meeting\s+([^\n]+)/);
    const meetingTitle = titleMatch ? titleMatch[1].trim() : null;
    
    // Extract originally planned date/time
    const dateMatch = body.match(/Originally planned date \/ time:\s*([^\n]+)/);
    if (!dateMatch || !meetingTitle) {
      Logger.log("Could not parse cancellation from: " + thread.getFirstMessageSubject());
      return;
    }
    
    const dateStr = dateMatch[1].trim();
    const eventTime = parseHubSpotDateTime(dateStr);
    
    if (!eventTime) {
      Logger.log("Failed to parse date: " + dateStr);
      return;
    }
    
    // Search for event within 24-hour window
    const searchStart = new Date(eventTime.getTime() - 12 * 60 * 60 * 1000);
    const searchEnd = new Date(eventTime.getTime() + 12 * 60 * 60 * 1000);
    
    const events = calendar.getEvents(searchStart, searchEnd);
    
    events.forEach(event => {
      if (event.getTitle().includes(meetingTitle)) {
        Logger.log(`Deleting event: ${event.getTitle()} on ${event.getStartTime()}`);
        event.deleteEvent();
      }
    });
    
    // Mark as processed
    thread.addLabel(processedLabel);
    thread.removeLabel(label);
  });
}

/**
 * Parse HubSpot date/time format
 * @param {string} dateStr - Date string in format "December 17, 2025 10:00 AM CST (UTC -06:00)"
 * @returns {Date|null} Parsed date object or null if parsing fails
 */
function parseHubSpotDateTime(dateStr) {
  // Format: "December 17, 2025 10:00 AM CST (UTC -06:00)"
  // or: "December 10, 2025 2:00 PM CST (UTC -06:00)"
  
  // Remove timezone info and parse
  const cleanStr = dateStr.replace(/\(UTC[^)]+\)/, '').trim();
  const date = new Date(cleanStr);
  
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return date;
}

/**
 * Write lead information to Google Sheet
 * Inserts row in chronological order (newest first)
 * 
 * @param {string} leadName - Full name of the lead
 * @param {string} email - Lead's email address
 * @param {string} phone - Lead's phone number
 * @param {Date} startTime - Meeting start time
 * @param {string} zoomLink - Zoom meeting link
 * @param {string} meetingTitle - Title of the meeting
 */
function writeLeadToSheet(leadName, email, phone, startTime, zoomLink, meetingTitle) {
  const SHEET_ID = '1dszRhBf8THlU6Tn8YvljnUtmw87RriMblp1LKPwchJ8';
  const SHEET_NAME = 'Sheet2';
  
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      Logger.log('Sheet not found: ' + SHEET_NAME);
      return;
    }
    
    // Split lead name into first and last
      
    // Clean lead name - remove email addresses like "Devine <addiedevine@yahoo.com>"
    leadName = leadName.split('<')[0].trim();
    const nameParts = leadName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Format date as MM/DD/YYYY
    const dateFormatted = Utilities.formatDate(startTime, Session.getScriptTimeZone(), 'MM/dd/yyyy');
    
    const dealId = Utilities.formatDate(startTime, Session.getScriptTimeZone(), 'yyyyMMddHHmm');
    
    // Prepare row data matching sheet columns:
    // A: Deal_ID, B: Date, C: Lead Last Name, D: Lead First Name, E: Phone Number, 
    // F: Email Address, G: Stage, H: Fathom Link, I: Demo duration, J: Objection, 
    // K: Reason, L: Suggested Rebuttal, M: Motivation, N: Payment, O: Deposit, P: State
    const rowData = [
      dealId,           // A: Deal_ID
      dateFormatted,    // B: Date
      lastName,         // C: Lead Last Name
      firstName,        // D: Lead First Name
      phone,            // E: Phone Number
      email,            // F: Email Address
      'Scheduled',      // G: Stage
      zoomLink,         // H: Fathom Link (using Zoom link)
      '',               // I: Demo duration
      '',               // J: Objection
      '',               // K: Reason
      '',               // L: Suggested Rebuttal
      '',               // M: Motivation
      '',               // N: Payment
      '',               // O: Deposit
      ''                // P: State
    ];
    
    // Insert row sorted by date (newest first)
    // Find the right position to insert
    const data = sheet.getDataRange().getValues();
    let insertPosition = 2; // Start after header row
    
    // Skip header and find position where this meeting should go
    for (let i = 1; i < data.length; i++) {
      const existingDealId = data[i][0]; // Column A contains Deal_ID in YYYYMMDDHHMM format
      if (dealId > existingDealId) {
        insertPosition = i + 1;
        break;
      }
      insertPosition = i + 2; // If we reach end, insert after last row
    }
    
    // Insert new row at the correct position
    sheet.insertRowAfter(insertPosition - 1);
    const range = sheet.getRange(insertPosition, 1, 1, rowData.length);
    range.setValues([rowData]);
    
    Logger.log('Added lead to sheet: ' + leadName + ' (' + email + ')');
    
  } catch (error) {
    Logger.log('Error writing to sheet: ' + error.message);
  }
}

/**
 * Backfill function to process historical HubSpot booking emails
 * Processes up to 500 historical emails and adds them to the Google Sheet
 * Does NOT create calendar events (only sheet entries)
 * 
 * Usage: Run this function once to import historical data
 */
function backfillHistoricalBookings() {
  // Search Gmail directly by subject
  const searchQuery = 'subject:"FW: You\'ve been booked by:"';
  const threads = GmailApp.search(searchQuery, 0, 500); // Get up to 500 emails
  Logger.log('Found ' + threads.length + ' booking emails to process');
  
  // Sort threads by date (oldest first)
  threads.sort(function(a, b) {
    return a.getLastMessageDate().getTime() - b.getLastMessageDate().getTime();
  });
  
  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  threads.forEach(thread => {
    try {
      const message = thread.getMessages()[0];
      const body = message.getPlainBody();
      const subject = message.getSubject();
      
      // Extract lead name from subject
      const leadMatch = subject.match(/FW: You've been booked by: (.+)/);
      const leadName = leadMatch ? leadMatch[1] : "Lead";
      
      // Extract meeting title
      const titleMatch = body.match(/New Meeting Booked\s+([^\n]+)/);
      const meetingTitle = titleMatch ? titleMatch[1].trim() : "HubSpot Meeting";
      
      // Extract date/time
      const dateMatch = body.match(/Date \/ time:\s*([^\n]+)/);
      if (!dateMatch) {
        Logger.log('Skipping - Could not parse date from: ' + subject);
        skippedCount++;
        return;
      }
      
      const dateStr = dateMatch[1].trim();
      const startTime = parseHubSpotDateTime(dateStr);
      
      if (!startTime) {
        Logger.log('Skipping - Failed to parse date: ' + dateStr);
        skippedCount++;
        return;
      }
      
      // Extract Zoom link
      const zoomMatch = body.match(/Location:\s*(https:\/\/[^\s]+)/);
      const zoomLink = zoomMatch ? zoomMatch[1].trim() : "";
      
      // Extract email
      const emailMatch = body.match(/Email address:\s*([^\s\n]+)/);
      let email = emailMatch ? emailMatch[1].trim() : "";
      
      // Clean up email - remove mailto: link formatting
      if (email.includes('<mailto:')) {
        email = email.split('<')[0].trim();
      }
      
      // Extract phone
      const phoneMatch = body.match(/Phone number:\s*([^\s\n]+)/);
      const phone = phoneMatch ? phoneMatch[1].trim() : "";
      
      // Write to Google Sheet (skip calendar creation for backfill)
      writeLeadToSheet(leadName, email, phone, startTime, zoomLink, meetingTitle);
      
      processedCount++;
      Logger.log('Processed (' + processedCount + '/' + threads.length + '): ' + leadName + ' - ' + dateStr);
      
    } catch (error) {
      errorCount++;
      Logger.log('Error processing thread: ' + error.message);
    }
  });
  
  Logger.log('\n=== Backfill Complete ===');
  Logger.log('Total emails found: ' + threads.length);
  Logger.log('Successfully processed: ' + processedCount);
  Logger.log('Skipped: ' + skippedCount);
  Logger.log('Errors: ' + errorCount);
}
