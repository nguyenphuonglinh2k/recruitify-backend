const TrainResult = require("../models/trainResult.model");
const User = require("../models/user.model");
const constant = require("../utils/constant");

module.exports.getNotEvaluatedUsers = async (_, res) => {
  try {
    const results = await TrainResult.find().lean();
    const evaluatedUserIds = results?.map(result => result.candidateId);

    const users = await User.find({
      _id: { $nin: evaluatedUserIds },
      role: constant.USER_ROLE.candidate,
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.getTrainResults = async (req, res) => {
  const status = req.query?.status;
  const options = {};

  if (status) {
    options.status = status;
  }

  try {
    const results = await TrainResult.find(options).populate([
      { path: "candidateId", select: "-password" },
    ]);

    res.json(results);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.getTrainResultDetail = async (req, res) => {
  const resultId = req.params.resultId;

  try {
    const result = await TrainResult.findById(resultId).populate([
      { path: "candidateId", select: "-password" },
    ]);

    res.json(result);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.postTrainResult = async (req, res) => {
  const { status, evaluation, candidateId, description } = req.body;

  if (!status || ![0, 1, 2, 3, 4, 5].includes(evaluation) || !candidateId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newResult = { status, evaluation, candidateId, description };

    await TrainResult.create(newResult).then((result, error) => {
      if (error) {
        return res.status(400).json({ message: "Create  failed", error });
      }

      return res
        .status(201)
        .json({ message: "Create successfully", data: result });
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.putTrainResult = async (req, res) => {
  const { status, evaluation, description } = req.body;
  const resultId = req.params.resultId;

  try {
    await TrainResult.findByIdAndUpdate(
      { _id: resultId },
      { status, evaluation, description },
      { new: true },
    ).then((result, error) => {
      if (error) {
        return res.status(400).json({ message: "Update failed", error });
      }

      res.json({ message: "Update successfully", data: result });
    });
  } catch (error) {
    res.status(400).json(error);
  }
};
