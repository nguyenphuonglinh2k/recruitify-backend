const User = require("../models/user.model");

module.exports.getUsers = async (_, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};
