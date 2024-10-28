# RPA Tool

### Dependencies
- puppeteer-extra: Used for automating web actions.
- Stealth Plugin: Helps avoid detection as a bot by bypassing anti-bot systems
- Anonymize UA Plugin: Masks your user agent to prevent tracking.
- Adblocker Plugin: Blocks ads and trackers.
- dotenv: Manages environment variables (for secure storage of sensitive data like email and password).
- Logger: Handles logging messages for actions.

## Features
- Login to Google with automated credential entry.
- Seamless navigation to a Google Sheet.
- Automate data copying from one sheet to another.
- Automatic sign-out at the end of operations.

## How It Works:
1. **Login Automation:** Enters email and password automatically.
2. **Google Sheets Navigation:** Opens specified Google Sheet URL.
3. **Data Operations:** Selects, copies, switches sheets, and pastes data.
4. **Logout:** Logs out from the Google account when done.  

## Why Puppeter

1. **Easy to Use:** Simple API for automation.
2. **Good Documentation:** Clear guides and examples.
3. **Automate Tasks:** Click buttons, fill forms, navigate pages.
6. **Screenshots & PDFs:** Easily capture page content.
7. **Time-Saving:** Faster and fewer errors than manual work.


## Setup:
1. Clone this repository.
2. Install dependencies using `npm install`.
3. Create a `.env` file with the following keys:
   - `GOOGLE_EMAIL=your-email`
   - `GOOGLE_PASSWORD=your-password`
   - `SPREADSHEET_URL=your-google-sheet-url`

4. Run the automation:
   ```bash
   npm start
   ```