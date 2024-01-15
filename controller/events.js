import { google } from "googleapis";
import { environment } from "../utils/environments.js";
import { credentials } from "../utils/credentials.js";
import { makeApiRequest, updateOrCreateContact } from "../utils/utils.js";
const { calendarId, hubspotApiKey } = environment;
const { client_id, client_secret, redirect_uris } = credentials.installed;

const scope = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/user.organization.read",
  "https://www.googleapis.com/auth/contacts.readonly",
];

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris
);

const authorizeUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scope,
  prompt: "consent",
});

export const login = (req, res) => {
  res.redirect(authorizeUrl);
};

export const callback = async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  req.tokens = tokens;
  oauth2Client.setCredentials(tokens);
  res.redirect("https://panlearn.com");
};
export const createCalendarEvent = async (req, res, next) => {
  try {
    makeApiRequest(oauth2Client, next);
    const { eventTitle, eventLocation, startTime, endTime, eventDescription } =
      req.body;

    const event = {
      summary: eventTitle,
      location: eventLocation,
      description: eventDescription,
      start: {
        dateTime: startTime,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: endTime,
        timeZone: "Asia/Kolkata",
      },

      attendees: [
        { email: "gayathrivenkatesh987@gmail.com", displayName: "Gayathri" },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 10 },
        ],
      },
    };

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const createdEvent = await calendar.events.insert({
      calendarId,
      resource: event,
    });
    res.status(200).json({
      message: "Event created successfully",
      statusCode: 200,
      eventId: createdEvent.data,
    });
  } catch (error) {
    next(error);
  }
};

export const addParticipants = async (req, res, next) => {
  try {
    makeApiRequest(oauth2Client, next);
    const { eventId, participants } = req.body;

    if (!eventId || !participants) {
      return res.status(400).json({ msg: "Bad Request", statusCode: 400 });
    }
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const getEvent = await calendar.events.get({
      calendarId,
      eventId,
    });
    const existingEvent = getEvent.data;
    existingEvent.attendees = [...participants, ...existingEvent.attendees];

    const update = await calendar.events.update({
      calendarId,
      eventId,
      resource: existingEvent,
    });

    if (update.data) {
      if (update.data.organizer.email) {
        const company = update.data.organizer.email.split("@")[1];
        const payload = {
          email: update.data.organizer.email || null,
          firstname: update.data.organizer?.displayName?.split(" ")[0] || "",
          lastname: update.data.organizer.displayName?.split(" ")[1] || "",
          company: company !== "gmail.com" ? company : "",
        };
        updateOrCreateContact(payload, hubspotApiKey, next);
      }
      const participants = update.data.attendees || [];
      for (const participant of participants) {
        if (participant.email) {
          const company = participant.email.split("@")[1];
          const payload = {
            email: participant.email || null,
            firstname: participant?.displayName?.split(" ")[0] || "",
            lastname: participant?.displayName?.split(" ")[1] || "",
            company: company !== "gmail.com" ? company : "",
          };
          updateOrCreateContact(payload, hubspotApiKey, next);
        }
      }
      res.status(200).json({ message: "Event updated successfully", update });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getEventParticipantDetails = async (req, res) => {
  try {
    makeApiRequest(oauth2Client, next);
    const { eventId } = req.query;
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const event = await calendar.events.get({
      calendarId,
      eventId,
    });
    const participants = event.data.attendees || [];

    for (const participant of participants) {
      if (participant.email) {
        updateOrCreateContact(
          participant.email,
          participant.displayName,
          hubspotApiKey,
          next
        );
      }
    }
    res.status(200).json({
      message: "Event updated successfully",
      statusCode: 200,
      participants,
    });
  } catch (error) {
    next(error);
  }
};
