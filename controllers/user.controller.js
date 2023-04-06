const User = require("../models/user.model");

module.exports.getUsers = async (_, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

module.exports.getUserInfo = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById({ _id: userId })
      .select("-password")
      .lean();

    res.json(user);
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.putUpdateProfile = async (req, res) => {
  const { name, avatarUrl, phoneNumber, address } = req.body;
  const userId = req.params.userId;

  try {
    const user = await User.findById({ _id: userId }).lean();

    await User.updateOne(
      { _id: userId },
      {
        name: name || user.name,
        avatarUrl: avatarUrl || user.avatarUrl,
        phoneNumber: phoneNumber || user.phoneNumber,
        address: address || user.address,
      },
      {},
    ).then((_, err) => {
      if (err) {
        res.status(400).json(err);
      } else {
        res.json({ message: "Update successfully" });
      }
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};
