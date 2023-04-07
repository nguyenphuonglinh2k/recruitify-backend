const { ObjectId } = require("mongodb");
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
    },
    status: {
      type: Number,
      required: true,
    },
    startDate: {
      type: String,
      required: false,
    },
    endDate: {
      type: String,
      required: false,
    },
    projectId: {
      type: ObjectId,
      required: false,
    },
    assigneeId: {
      type: ObjectId,
      required: true,
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
