import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.login_token;
  if (!token) {
    throw "You are not authenticated!";
  }

  jwt.verify(token, process.env.JWT, (err, user) => {
    if (err) {
      throw "Token Invalid";
    }
    req.user = user;
    next();
  });
};
