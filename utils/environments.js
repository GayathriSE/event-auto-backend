import * as dotenv from "dotenv";
dotenv.config();

export const environment = {
  client_email: process.env.CALENDAR_EMAIL,
  private_key: process.env.CALENDAR_PRIVATE_KEY,
  credential: process.env.CREDENTIALS,
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: ["http://localhost:3000/api/call-back"],
  calendarId: process.env.GOOGLE_CALENDER_ID,
  hubspotApiKey: process.env.HUBSPOT_API_KEY,
  accessToken: process.env.ACCESS_TOKEN,
  refreshToken: process.env.REFRESH_TOKEN,
};
