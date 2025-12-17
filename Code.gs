/**
 * Calendar Extractor - Main Script
 * Extracts calendar events from Gmail and adds them to Google Calendar and Google Sheets
 */

/**
 * Main function to process emails and extract calendar events
 */
function processCalendarEmails() {
  try {
    Logger.log('Starting calendar email processing...');
    
    // Get configuration
    const config = getConfig();
    
    // Search for emails matching the query
    const threads = GmailApp.search(config.searchQuery, 0, config.maxEmails);
    Logger.log(`Found ${threads.length} email threads to process`);
    
    let processedCount = 0;
    
    // Process each thread
    for (let i = 0; i < threads.length; i++) {
      const messages = threads[i].getMessages();
      
      for (let j = 0; j < messages.length; j++) {
        const message = messages[j];
        
        // Skip if already processed
        if (isAlreadyProcessed(message)) {
          Logger.log(`Message already processed: ${message.getSubject()}`);
          continue;
        }
        
        // Extract event details from email
        const eventDetails = extractEventDetails(message);
        
        if (eventDetails) {
          // Add to Google Calendar
          const calendarEvent = addToCalendar(eventDetails);
          
          // Log to Google Sheets
          if (calendarEvent) {
            logToSheet(eventDetails, calendarEvent);
            markAsProcessed(message);
            processedCount++;
          }
        }
      }
    }
    
    Logger.log(`Processing complete. ${processedCount} events added.`);
    return processedCount;
    
  } catch (error) {
    Logger.log(`Error in processCalendarEmails: ${error.toString()}`);
    throw error;
  }
}

/**
 * Extract event details from email message
 * @param {GmailMessage} message - The Gmail message to parse
 * @return {Object|null} Event details or null if parsing fails
 */
function extractEventDetails(message) {
  try {
    const subject = message.getSubject();
    const body = message.getPlainBody();
    const htmlBody = message.getBody();
    
    Logger.log(`Extracting details from: ${subject}`);
    
    // Initialize event object
    const event = {
      title: subject,
      description: '',
      location: '',
      startTime: null,
      endTime: null,
      attendees: [],
      source: message.getId()
    };
    
    // Extract date and time using various patterns
    event.startTime = extractDateTime(body, htmlBody);
    
    if (!event.startTime) {
      Logger.log(`Could not extract date/time from message: ${subject}`);
      return null;
    }
    
    // Set default end time (1 hour after start)
    event.endTime = new Date(event.startTime.getTime() + (60 * 60 * 1000));
    
    // Extract location
    event.location = extractLocation(body, htmlBody);
    
    // Extract description
    event.description = extractDescription(body, subject);
    
    // Extract attendees
    event.attendees = extractAttendees(message);
    
    return event;
    
  } catch (error) {
    Logger.log(`Error extracting event details: ${error.toString()}`);
    return null;
  }
}

/**
 * Add event to Google Calendar
 * @param {Object} eventDetails - The event details to add
 * @return {CalendarEvent|null} The created calendar event
 */
function addToCalendar(eventDetails) {
  try {
    const config = getConfig();
    const calendar = CalendarApp.getCalendarById(config.calendarId);
    
    if (!calendar) {
      Logger.log(`Calendar not found: ${config.calendarId}`);
      return null;
    }
    
    // Create calendar event
    const calendarEvent = calendar.createEvent(
      eventDetails.title,
      eventDetails.startTime,
      eventDetails.endTime,
      {
        description: eventDetails.description,
        location: eventDetails.location,
        guests: eventDetails.attendees.join(','),
        sendInvites: false
      }
    );
    
    Logger.log(`Event added to calendar: ${eventDetails.title}`);
    return calendarEvent;
    
  } catch (error) {
    Logger.log(`Error adding to calendar: ${error.toString()}`);
    return null;
  }
}

/**
 * Log event details to Google Sheets
 * @param {Object} eventDetails - The event details
 * @param {CalendarEvent} calendarEvent - The calendar event
 */
function logToSheet(eventDetails, calendarEvent) {
  try {
    const config = getConfig();
    const sheet = SpreadsheetApp.openById(config.spreadsheetId).getActiveSheet();
    
    // Prepare row data
    const rowData = [
      new Date(), // Timestamp
      eventDetails.title,
      eventDetails.startTime,
      eventDetails.endTime,
      eventDetails.location,
      eventDetails.description,
      eventDetails.attendees.join(', '),
      calendarEvent.getId(),
      eventDetails.source
    ];
    
    sheet.appendRow(rowData);
    Logger.log(`Event logged to sheet: ${eventDetails.title}`);
    
  } catch (error) {
    Logger.log(`Error logging to sheet: ${error.toString()}`);
  }
}

/**
 * Check if message has already been processed
 * @param {GmailMessage} message - The message to check
 * @return {boolean} True if already processed
 */
function isAlreadyProcessed(message) {
  const config = getConfig();
  const label = GmailApp.getUserLabelByName(config.processedLabel);
  
  if (!label) {
    return false;
  }
  
  const thread = message.getThread();
  const labels = thread.getLabels();
  
  return labels.some(l => l.getName() === config.processedLabel);
}

/**
 * Mark message as processed
 * @param {GmailMessage} message - The message to mark
 */
function markAsProcessed(message) {
  const config = getConfig();
  let label = GmailApp.getUserLabelByName(config.processedLabel);
  
  if (!label) {
    label = GmailApp.createLabel(config.processedLabel);
  }
  
  message.getThread().addLabel(label);
}

/**
 * Create time-based trigger to run automatically
 */
function createTrigger() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'processCalendarEmails') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger to run every hour
  ScriptApp.newTrigger('processCalendarEmails')
    .timeBased()
    .everyHours(1)
    .create();
    
  Logger.log('Trigger created successfully');
}

/**
 * Initialize the spreadsheet with headers
 */
function initializeSheet() {
  try {
    const config = getConfig();
    const spreadsheet = SpreadsheetApp.openById(config.spreadsheetId);
    let sheet = spreadsheet.getActiveSheet();
    
    // Check if headers already exist
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Timestamp',
        'Event Title',
        'Start Time',
        'End Time',
        'Location',
        'Description',
        'Attendees',
        'Calendar Event ID',
        'Source Email ID'
      ];
      
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      Logger.log('Sheet initialized with headers');
    }
    
  } catch (error) {
    Logger.log(`Error initializing sheet: ${error.toString()}`);
  }
}
