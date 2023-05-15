const TrainResult = require("../models/trainResult.model");

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

  if (!status || !evaluation || !candidateId) {
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
  const { status, evaluation, candidateId, description } = req.body;
  const resultId = req.params.resultId;

  try {
    await TrainResult.findByIdAndUpdate(
      { _id: resultId },
      { status, evaluation, candidateId, description },
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
