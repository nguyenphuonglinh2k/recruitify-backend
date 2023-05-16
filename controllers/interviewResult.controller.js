const InterviewResult = require("../models/interviewResult.model");

module.exports.getInterviewResults = async (req, res) => {
  const status = req.query?.status;
  const options = {};

  if (status) {
    options.status = status;
  }

  try {
    const results = await InterviewResult.find(options).populate([
      { path: "applicationId" },
    ]);

    res.json(results);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.getInterviewResultDetail = async (req, res) => {
  const resultId = req.params.resultId;

  try {
    const result = await InterviewResult.findById(resultId).populate([
      { path: "applicationId" },
    ]);

    res.json(result);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.postInterviewResult = async (req, res) => {
  const { status, evaluation, applicationId, description } = req.body;

  if (!status || ![0, 1, 2, 3, 4, 5].includes(evaluation) || !applicationId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newResult = { status, evaluation, applicationId, description };

    await InterviewResult.create(newResult).then((result, error) => {
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

module.exports.putInterviewResult = async (req, res) => {
  const { status, evaluation, description } = req.body;
  const resultId = req.params.resultId;

  try {
    await InterviewResult.findByIdAndUpdate(
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
