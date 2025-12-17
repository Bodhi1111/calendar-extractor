/**
 * Utility functions for parsing email content
 */

/**
 * Extract date and time from email content
 * @param {string} body - Plain text body
 * @param {string} htmlBody - HTML body
 * @return {Date|null} Extracted date/time or null
 */
function extractDateTime(body, htmlBody) {
  // Common date/time patterns
  const patterns = [
    // ISO format: 2025-01-15 14:30 or 2025-01-15T14:30:00
    /(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}(?::\d{2})?)/i,
    
    // US format: January 15, 2025 at 2:30 PM
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})\s+at\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i,
    
    // Short format: Jan 15, 2025 2:30 PM
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i,
    
    // Numeric format: 01/15/2025 14:30
    /(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/,
    
    // Date with time: 15-01-2025 14:30
    /(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{2})/
  ];
  
  const text = body + ' ' + htmlBody;
  
  for (let pattern of patterns) {
    const match = text.match(pattern);
    
    if (match) {
      try {
        // Try to parse the matched string as a date
        let dateStr = match[0];
        let date = new Date(dateStr);
        
        // Validate the date
        if (date && !isNaN(date.getTime())) {
          return date;
        }
      } catch (e) {
        Logger.log(`Error parsing date: ${e.toString()}`);
      }
    }
  }
  
  // Try to find any date in the text using natural language parsing
  const dateRegex = /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})\b/;
  const timeRegex = /\b(\d{1,2}:\d{2}\s*(?:AM|PM)?)\b/i;
  
  const dateMatch = text.match(dateRegex);
  const timeMatch = text.match(timeRegex);
  
  if (dateMatch) {
    let dateTimeStr = dateMatch[0];
    if (timeMatch) {
      dateTimeStr += ' ' + timeMatch[0];
    }
    
    try {
      const date = new Date(dateTimeStr);
      if (date && !isNaN(date.getTime())) {
        return date;
      }
    } catch (e) {
      Logger.log(`Error parsing combined date/time: ${e.toString()}`);
    }
  }
  
  return null;
}

/**
 * Extract location from email content
 * @param {string} body - Plain text body
 * @param {string} htmlBody - HTML body
 * @return {string} Extracted location
 */
function extractLocation(body, htmlBody) {
  const text = body + ' ' + htmlBody;
  
  // Common location patterns
  const patterns = [
    /location:\s*([^\n]+)/i,
    /where:\s*([^\n]+)/i,
    /venue:\s*([^\n]+)/i,
    /place:\s*([^\n]+)/i,
    /address:\s*([^\n]+)/i,
    /at\s+([A-Z][^\n,]+(?:(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl)[^\n,]*))/,
    /room\s+([A-Z0-9\-]+)/i
  ];
  
  for (let pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
}

/**
 * Extract description from email body
 * @param {string} body - Plain text body
 * @param {string} subject - Email subject
 * @return {string} Extracted description
 */
function extractDescription(body, subject) {
  // Clean up the body text
  let description = body.trim();
  
  // Remove common email signatures and footers
  const cutoffs = [
    '---',
    '___',
    'Best regards',
    'Best Regards',
    'Sincerely',
    'Thanks',
    'Thank you',
    'Sent from'
  ];
  
  for (let cutoff of cutoffs) {
    const index = description.indexOf(cutoff);
    if (index > 0) {
      description = description.substring(0, index);
    }
  }
  
  // Limit description length
  const maxLength = 500;
  if (description.length > maxLength) {
    description = description.substring(0, maxLength) + '...';
  }
  
  return description.trim();
}

/**
 * Extract attendees from email message
 * @param {GmailMessage} message - The Gmail message
 * @return {Array<string>} Array of attendee email addresses
 */
function extractAttendees(message) {
  const attendees = [];
  
  try {
    // Get sender
    const from = message.getFrom();
    const fromEmail = extractEmail(from);
    if (fromEmail) {
      attendees.push(fromEmail);
    }
    
    // Get CC recipients
    const cc = message.getCc();
    if (cc) {
      const ccEmails = cc.split(',');
      ccEmails.forEach(email => {
        const extracted = extractEmail(email);
        if (extracted && !attendees.includes(extracted)) {
          attendees.push(extracted);
        }
      });
    }
    
  } catch (error) {
    Logger.log(`Error extracting attendees: ${error.toString()}`);
  }
  
  return attendees;
}

/**
 * Extract email address from a string that may contain name and email
 * @param {string} emailString - String containing email
 * @return {string} Extracted email address
 */
function extractEmail(emailString) {
  const match = emailString.match(/[\w.\-]+@[\w.\-]+\.\w+/);
  return match ? match[0] : '';
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @return {string} Formatted date string
 */
function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Parse duration string (e.g., "1 hour", "30 minutes", "2h")
 * @param {string} durationStr - Duration string to parse
 * @return {number} Duration in milliseconds
 */
function parseDuration(durationStr) {
  const hourMatch = durationStr.match(/(\d+)\s*(?:hour|hr|h)/i);
  const minuteMatch = durationStr.match(/(\d+)\s*(?:minute|min|m)/i);
  
  let duration = 0;
  
  if (hourMatch) {
    duration += parseInt(hourMatch[1]) * 60 * 60 * 1000;
  }
  
  if (minuteMatch) {
    duration += parseInt(minuteMatch[1]) * 60 * 1000;
  }
  
  // Default to 1 hour if no duration found
  return duration || (60 * 60 * 1000);
}
