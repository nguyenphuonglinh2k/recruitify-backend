const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
      default: "",
    },
    dateTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    assigneeIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
      },
    ],
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Application",
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Job",
    },
  },
  {
    virtuals: true,
    versionKey: false,
    timestamps: true,
  },
);

const Schedule = mongoose.model("Schedule", schema, "schedules");

module.exports = Schedule;
