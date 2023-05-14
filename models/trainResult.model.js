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
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    description: {
      type: String,
      required: false,
    },
    projectIds: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Project",
    },
    taskIds: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Task",
    },
  },
  {
    virtuals: true,
    versionKey: false,
    timestamps: true,
  },
);

const TrainResult = mongoose.model("TrainResult", schema, "trainResults");

module.exports = TrainResult;
