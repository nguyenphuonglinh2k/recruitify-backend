const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    status: {
      type: Number,
      required: true,
    },
    evaluation: {
      type: Number,
      required: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Application",
    },
    positionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Job",
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    virtuals: true,
    versionKey: false,
    timestamps: true,
  },
);

const InterviewResult = mongoose.model(
  "InterviewResult",
  schema,
  "interviewResults",
);

module.exports = InterviewResult;
