// puppeteer_spreadsheet.js
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
const stealth = StealthPlugin();
stealth.enabledEvasions.delete("iframe.contentWindow");
stealth.enabledEvasions.delete("media.codecs");
puppeteer.use(stealth);
import AnonymizeUAPlugin from "puppeteer-extra-plugin-anonymize-ua";
puppeteer.use(AnonymizeUAPlugin());
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
import dotenv from "dotenv";
import pg from "pg";
const { Pool } = pg;

import Logger from "@actuals_assignment/logger";
import cred from "./config/config.js";
import config from "./config/config.js";

dotenv.config();

class GoogleSheetsPuppeteerRPA {
  constructor() {
    this.email = cred.GOOGLE_EMAIL;
    this.password = cred.GOOGLE_PASSWORD;
    this.spreadsheetUrl = cred.SPREADSHEET_URL;
  }
  async checkIfLoggedIn(page) {
    try {
      await page.goto("https://accounts.google.com/SignOutOptions", {
        waitUntil: "networkidle0",
      });

      const isLoggedIn = await page.evaluate(() => {
        const accountMenu = document.querySelector("div[data-identifier]");
        return !!accountMenu;
      });

      Logger.log(
        `User is ${isLoggedIn ? "already logged in" : "not logged in"}`
      );
      return isLoggedIn;
    } catch (error) {
      Logger.error("Error checking login status:", error);
      return false;
    }
  }

  async loginToGoogle(page) {
    try {
      await page.goto("https://accounts.google.com/signin/v2/identifier", {
        waitUntil: "networkidle0",
      });

      const useAnotherAccountButton = await page.evaluate(() => {
        const buttons = Array.from(
          document.querySelectorAll('div[role="link"]')
        );
        const targetButton = buttons.find((button) =>
          button.textContent.toLowerCase().includes("use another account")
        );
        return targetButton !== undefined;
      });

      if (useAnotherAccountButton) {
        Logger.log("Found 'Use Another Account' button, clicking it...");
        await page.evaluate(() => {
          const buttons = Array.from(
            document.querySelectorAll('div[role="link"]')
          );
          const targetButton = buttons.find((button) =>
            button.textContent.toLowerCase().includes("use another account")
          );
          targetButton.click();
        });

        await page.waitForSelector('input[type="email"]', { visible: true });
      }

      Logger.log("Entering email...");
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', this.email, { delay: 100 }); // Add delay to seem more human-like

      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        page.click("#identifierNext"),
      ]);

      Logger.log("Entering password...");
      await page.waitForSelector('input[type="password"]', { visible: true });
      await page.type('input[type="password"]', this.password, { delay: 100 });

      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0" }),
        page.click("#passwordNext"),
      ]);

      // for 2FA if enabled
      await new Promise((resolve) => setTimeout(resolve, 10000));

      Logger.log("Successfully logged into Google");
    } catch (error) {
      Logger.error("Error during Google login:", error);
      throw error;
    }
  }

  async copyBetweenSheets() {
    let browser;
    let page;

    try {
      Logger.log("Starting browser automation");

      browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        ignoreDefaultArgs: ["--disable-extensions"],
        args: [
          "--start-maximized",
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--user-data-dir=${path.join(__dirname, 'dev-user-data')}",
        ],
      });

      page = await browser.newPage();

      let login_link = "https://google.com/";
      await page.goto(login_link);

      // Login to Google
      await this.loginToGoogle(page);

      // Navigate to the spreadsheet
      Logger.log("Navigating to spreadsheet...");
      await page.goto(this.spreadsheetUrl);
      Logger.log("Copying data between sheets...");
      await this.performSheetOperations(page);
      Logger.log("Data copied successfully between sheets");

      // Logout from Google
      await this.logoutFromGoogle(page).then(async () => {
        await browser.close();
      });
    } catch (error) {
      Logger.error("Error in copyBetweenSheets:", error);
      throw error;
    }
  }
  async logoutFromGoogle(page) {
    try {
      Logger.log("Initiating logout process...");

      await page.goto("https://accounts.google.com/SignOutOptions", {
        waitUntil: "networkidle0",
      });

      const signOutButton = await page.waitForSelector("button.sign-out");
      await signOutButton.click();

      await page.waitForNavigation({ waitUntil: "networkidle0" });

      Logger.log("Successfully logged out from Google");
    } catch (error) {
      Logger.error("Error during logout:", error);
      throw error;
    }
  }

  async performSheetOperations(page) {
    // Select all (Ctrl+A)
    await page.keyboard.down("Control");
    await page.keyboard.press("a");
    await page.keyboard.up("Control");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Copy (Ctrl+C)
    await page.keyboard.down("Control");
    await page.keyboard.press("c");
    await page.keyboard.up("Control");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const copiedData = await page.evaluate(() => {
      return navigator.clipboard.readText();
    });

    Logger.log("Copied Data:", copiedData);

    // await this.copytoPostgres(copiedData);

    // Switch the sheet
    await page.keyboard.down("Shift");
    await page.keyboard.press("F11");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Paste (Ctrl+V)
    await page.keyboard.down("Control");
    await page.keyboard.press("v");
    await page.keyboard.up("Control");
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  async copytoPostgres(data) {
    const pool = new Pool({
      user: config.PGUSER,
      host: config.PGHOST,
      database: config.DATABASE,
      password: config.PGPASSWORD,
      port: config.PGPORT,
    });
    const header = data.split("\n")[0].split("\t");

    const dataRows = data.split("\n");
    const dataArray = dataRows.map((row, index) => {
      if (index === 0) return;
      return row.split("\t");
    });
    const headerForInitialization = header
      .map((head) => {
        return head.toLowerCase() + " TEXT";
      })
      .join(", ");

    const createTableQuery = `
                CREATE TABLE IF NOT EXISTS sheet_data (
                    id SERIAL PRIMARY KEY,
                    ${headerForInitialization},
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
    await pool.query(createTableQuery);
    const headerForInsertion = header.join(", ");
    for (let i = 1; i < dataArray.length; i++) {
      const row = dataArray[i];
      const values = row.map((value) =>
        typeof value === "string" ? value.replace(/'/g, "''") : value
      );

      const insertQuery = `
                    INSERT INTO sheet_data (${headerForInsertion})
                    VALUES (${values.map((v) => `'${v}'`).join(",")})
                `;
      await pool.query(insertQuery);
    }
  }
}

const rpa = new GoogleSheetsPuppeteerRPA();
rpa.copyBetweenSheets();
