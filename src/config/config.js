import cred from "./cred.json" with { type: "json" };
import dotenv from 'dotenv'
dotenv.config()

export default {
    SPREADSHEET_URL: process.env.GOOGLE_SHEET_ID,
    GOOGLE_EMAIL: process.env.GOOGLE_EMAIL,
    GOOGLE_PASSWORD: process.env.GOOGLE_PASSWORD,
}
