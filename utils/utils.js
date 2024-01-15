import axios from "axios";
import { environment } from "./environments.js";

const { accessToken, refreshToken } = environment;

const isAccessTokenExpired = (oauth2Client) => {
  const expirationTime = oauth2Client?.credentials?.expiry_date || 0;
  const currentTime = new Date().getTime();
  return currentTime >= expirationTime;
};

export const makeApiRequest = async (oauth2Client, next) => {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    scope: "https://www.googleapis.com/auth/calendar",
    token_type: "Bearer",
    expiry_date: 1705186844952,
  });

  if (isAccessTokenExpired(oauth2Client)) {
    try {
      const { tokens } = await oauth2Client.refreshToken(
        oauth2Client.credentials.refresh_token
      );

      oauth2Client.setCredentials(tokens);
    } catch (error) {
      next(error);
    }
  }
};

async function isContactPresent(email, apiKey, next) {
  try {
    const hubspotApiEndpoint = `https://api.hubapi.com/crm/v3/objects/contacts/search`;
    const response = await axios.post(
      hubspotApiEndpoint,
      {
        filterGroups: [
          {
            filters: [
              {
                value: email,
                propertyName: "email",
                operator: "EQ",
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    const matchingContacts = response?.data?.results;
    return matchingContacts;
  } catch (error) {
    next(error);
  }
}

export const updateOrCreateContact = async (payload, apiKey, next) => {
  try {
    const contactExists = await isContactPresent(payload.email, apiKey, next);
    const hubspotApiEndpoint = "https://api.hubapi.com/crm/v3/objects/contacts";

    if (contactExists?.length) {
      const response = await axios.patch(
        `${hubspotApiEndpoint}/${contactExists[0].id}`,
        {
          properties: payload,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
    } else {
      const response = await axios.post(
        hubspotApiEndpoint,
        {
          properties: payload,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      console.log(
        `Contact with email '${payload.email}' created successfully.`
      );
    }
  } catch (error) {
    next(error);
  }
};

export const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);
  return res.status(500).json({
    error: errMsg,
    message: err.message || "Something went wrong!",
  });
};
