const Project = require("../models/project.model");
const Task = require("../models/task.model");
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
  const { name, avatarUrl, phoneNumber, address, role } = req.body;
  const userId = req.params.userId;

  try {
    const user = await User.findById({ _id: userId }).lean();

    await User.findByIdAndUpdate(
      { _id: userId },
      {
        name: name || user.name,
        avatarUrl: avatarUrl || user.avatarUrl,
        phoneNumber: phoneNumber || user?.phoneNumber,
        address: address || user?.address,
        role: role || user.role,
      },
      { new: true },
    )
      .select("-password")
      .then((result, err) => {
        if (err) {
          res.status(400).json(err);
        } else {
          res.json({ message: "Update successfully", data: result });
        }
      });
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.deleteUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    // 1. Delete user
    const deleteUserPromise = await User.findOneAndDelete({ _id: userId });

    // 2. Delete member in project
    const deleteMemberInProjectPromise = await Project.updateMany(
      {},
      { $pull: { memberIds: userId } },
    );

    // 3. Delete task
    const deleteTaskPromise = await Task.deleteMany({ assigneeId: userId });

    // 4. Delete project
    const deleteProjectPromise = await Project.deleteMany({
      creatorId: userId,
    });

    Promise.all([
      deleteUserPromise,
      deleteMemberInProjectPromise,
      deleteTaskPromise,
      deleteProjectPromise,
    ]).then(result => {
      if (result) {
        return res.json({ message: "Delete successfully" });
      }
      res.status(400).json({ message: "Delete failed" });
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};
