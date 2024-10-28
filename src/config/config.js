import dotenv from "dotenv";
dotenv.config();

export default {
  SPREADSHEET_URL: process.env.SPREADSHEET_URL,
  GOOGLE_EMAIL: process.env.GOOGLE_EMAIL,
  GOOGLE_PASSWORD: process.env.GOOGLE_PASSWORD,
  PGPASSWORD: process.env.PGPASSWORD,
};
