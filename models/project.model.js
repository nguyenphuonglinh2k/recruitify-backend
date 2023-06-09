const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      required: true,
    },
    creatorId: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    startDate: {
      type: String,
      required: false,
    },
    endDate: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    taskTotal: {
      type: Number,
      required: false,
      default: 0,
    },
    memberIds: [
      {
        type: ObjectId,
        required: false,
        ref: "User",
      },
    ],
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

const Project = mongoose.model("Project", schema, "projects");

module.exports = Project;
