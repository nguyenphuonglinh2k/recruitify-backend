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
    documentIds: {
      type: Array,
      required: false,
    },
    locations: [
      {
        type: String,
        required: false,
      },
    ],
    assigneeIds: [
      {
        type: ObjectId,
        required: false,
        ref: "User",
      },
    ],
    tagIds: [
      {
        type: ObjectId,
        required: false,
        ref: "Tag",
      },
    ],
    isPriority: {
      type: Boolean,
      required: false,
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

const Job = mongoose.model("Job", schema, "jobs");

module.exports = Job;
