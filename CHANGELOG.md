# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-12-17

### Added
- Initial release of HubSpot Meeting Calendar Sync
- Automated processing of booked meetings from Gmail to Google Calendar
- Automated processing of canceled meetings with event deletion
- Google Sheets integration for lead tracking
- Chronological sorting of leads (newest first) in sheet
- Backfill function for historical email processing
- Email cleaning (mailto links, embedded emails in names)
- Deal ID generation based on timestamp (yyyyMMddHHmm format)
- Smart label management (HS-Processed) to prevent duplicate processing
- Comprehensive error logging
- Support for 60-minute default meeting duration
- Zoom link extraction and storage

### Features
- Email parsing for HubSpot notification format
- Lead name extraction and splitting (first/last)
- Phone and email extraction with cleanup
- Calendar event creation with guest invitations
- Sheet row insertion with proper positioning
- 24-hour window search for canceled event matching

### Documentation
- Complete README with setup instructions
- Quick setup guide (SETUP.md)
- Inline code documentation
- Configuration reference
- Troubleshooting guide
- Future improvement roadmap

## [Unreleased]

### Planned
- Duplicate detection in Google Sheet
- Support for recurring meetings
- Email notifications for failed processing
- Custom meeting duration based on meeting type
- Better error handling and retry logic
- CRM system integration
- Lead status update monitoring
