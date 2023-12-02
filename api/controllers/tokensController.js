import jwt from "jsonwebtoken";
import { Session } from "../modals/Schema.js";

export const verifyToken = async (req, res, next) => {
  // Extract tokens from cookies and headers
  const accessToken = req.headers["authorization"];
  const refreshToken = req.cookies.refresh_token;

  // Don't issue new token if access token is absent even if refresh token is present
  if (!accessToken) {
    return res.status(401).send("Invalid Token");
  }

  try {
    // Extract the access_token out of the auth header
    const token = accessToken.split(" ")[1];

    // Verify access_token
    const decoded = jwt.verify(token, process.env.JWT);

    // Successful verification, attach decoded JWT payload to the request
    req.user = decoded;

    next(); // Let the user continue
  } catch (err) {
    // If access_token's expired handle new token generation
    if (err.name === "TokenExpiredError") {
      try {
        // Verify refreshToken
        const decoded = jwt.verify(refreshToken, process.env.REFRESH);

        const session = await Session.find({ token: refreshToken });

        if (session.length < 0 || Date.now() > session[0].expireAt) {
          return res.status(401).send("Invalid Token");
        }

        // Refresh token is valid, generate a new access token and send it in the response
        const newAccessToken = jwt.sign(
          {
            username: decoded.username,
            profileId: decoded.profileId,
          },
          process.env.JWT,
          {
            expiresIn: "30s", // Token expiration time
          }
        );

        // Extract the old expired token out of the headers
        const { Authorization, ...headers } = req.headers;

        // Add new access_token to the headers to let the request continue
        const newHeaders = {
          ...headers,
          Authorization: `Bearer ${newAccessToken}`,
        };

        // Replace old headers with new ones
        req.headers = newHeaders;

        // Attach decoded JWT payload to the request
        req.user = decoded;

        // Add newAccessToken to the response for client token updation
        res.body = {
          newAccessToken: newAccessToken,
          username: decoded.username,
          profileId: decoded.profileId,
        };

        // Call the next middleware
        next();
      } catch (err) {
        // Don't issue new token if refresh_token is expired or invalid
        return res.status(401).send("Invalid Token");
      }
    } else {
      // Other errors reflect tempering or other suspecious reasons, DON'T ISSUE TOKEN!!
      return res.status(401).send("Invalid Token");
    }
  }
};

export const refresh = async (req, res, next) => {
  // Extract tokens from cookies and headers
  console.log("inside ref");
  const accessToken = req.headers["authorization"];
  const refreshToken = req.cookies.refresh_token;

  // Don't issue new token if access token is absent even if refresh token is present
  if (!accessToken) {
    return res.status(401).send("Invalid Token");
  }

  try {
    // Verify refreshToken
    const decoded = jwt.verify(refreshToken, process.env.REFRESH);

    // Refresh token is valid, generate a new access token and send it in the response
    const newAccessToken = jwt.sign(
      {
        username: decoded.username,
        profileId: decoded.profileId,
      },
      process.env.JWT,
      {
        expiresIn: "30s", // Token expiration time
      }
    );

    // Extract the old expired token out of the headers
    const { Authorization, ...headers } = req.headers;

    // Add new access_token to the headers to let the request continue
    const newHeaders = {
      ...headers,
      Authorization: `Bearer ${newAccessToken}`,
    };

    // Replace old headers with new ones
    req.headers = newHeaders;

    // Attach decoded JWT payload to the request
    req.user = decoded;

    // Add newAccessToken to the response for client token updation
    res.body = {
      newAccessToken: newAccessToken,
      username: decoded.username,
      profileId: decoded.profileId,
    };

    res.status(200).send({
      newAccessToken: newAccessToken,
      username: decoded.username,
      profileId: decoded.profileId,
    });
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
};
