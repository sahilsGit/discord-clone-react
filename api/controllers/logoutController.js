import { Session } from "../models/Schema.js";

const handleLogout = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (cookies.refresh_token) {
      res.clearCookie("refresh_token");
    }

    await Session.findOneAndRemove({ token: cookies.refresh_token });

    // Send a response to the client
    res.send("Success! Cookies' gone");
  } catch (err) {
    err.status = 500;
    err.message = "Internal server error!";

    next(err);
  }
};

export default handleLogout;
