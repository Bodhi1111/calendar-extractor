/**
 * Configuration settings for Calendar Extractor
 */

/**
 * Get configuration settings
 * @return {Object} Configuration object
 */
function getConfig() {
  return {
    // Gmail search query to find calendar-related emails
    // Examples: 
    // - "subject:(meeting OR event OR invitation)"
    // - "from:calendar@example.com"
    // - "has:attachment filename:ics"
    searchQuery: 'subject:(meeting OR event OR appointment) -label:calendar-processed',
    
    // Maximum number of emails to process in one run
    maxEmails: 50,
    
    // Google Calendar ID (use 'primary' for default calendar or specific calendar ID)
    calendarId: 'primary',
    
    // Google Sheets ID for logging events
    // Replace with your actual spreadsheet ID from the URL
    spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE',
    
    // Label to mark processed emails
    processedLabel: 'calendar-processed'
  };
}

/**
 * Update configuration settings
 * This function can be used to programmatically update settings
 */
function updateConfig(newConfig) {
  const scriptProperties = PropertiesService.getScriptProperties();
  
  if (newConfig.searchQuery) {
    scriptProperties.setProperty('SEARCH_QUERY', newConfig.searchQuery);
  }
  
  if (newConfig.maxEmails) {
    scriptProperties.setProperty('MAX_EMAILS', newConfig.maxEmails.toString());
  }
  
  if (newConfig.calendarId) {
    scriptProperties.setProperty('CALENDAR_ID', newConfig.calendarId);
  }
  
  if (newConfig.spreadsheetId) {
    scriptProperties.setProperty('SPREADSHEET_ID', newConfig.spreadsheetId);
  }
  
  if (newConfig.processedLabel) {
    scriptProperties.setProperty('PROCESSED_LABEL', newConfig.processedLabel);
  }
  
  Logger.log('Configuration updated');
}

/**
 * Get configuration from script properties (if set)
 * Falls back to defaults in getConfig() if not set
 */
function getConfigFromProperties() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const defaultConfig = getConfig();
  
  return {
    searchQuery: scriptProperties.getProperty('SEARCH_QUERY') || defaultConfig.searchQuery,
    maxEmails: parseInt(scriptProperties.getProperty('MAX_EMAILS')) || defaultConfig.maxEmails,
    calendarId: scriptProperties.getProperty('CALENDAR_ID') || defaultConfig.calendarId,
    spreadsheetId: scriptProperties.getProperty('SPREADSHEET_ID') || defaultConfig.spreadsheetId,
    processedLabel: scriptProperties.getProperty('PROCESSED_LABEL') || defaultConfig.processedLabel
  };
}
