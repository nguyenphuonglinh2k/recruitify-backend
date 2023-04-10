require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.requiredLogin = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization)
    return res.status(401).json({ message: "You must be logged in" });

  jwt.verify(authorization, process.env.JWT_KEY, function (err, payload) {
    if (err) {
      console.log(err);
      return res.status(401).json({ message: "You must be logged in" });
    }
    req.user = payload.user;
    next();
  });
};
