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
    },
    progress: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: false,
    },
    endDate: {
      type: Date,
      required: false,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Project",
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    virtuals: true,
    versionKey: false,
    timestamps: true,
  },
);

schema.virtual("id", {
  id: this.id,
});

const Task = mongoose.model("Task", schema, "tasks");

module.exports = Task;
