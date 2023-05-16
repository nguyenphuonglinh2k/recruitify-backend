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
    description: {
      type: String,
      required: false,
      default: "",
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
