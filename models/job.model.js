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
      type: Date,
      required: false,
    },
    endDate: {
      type: Date,
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
    tagIds: [
      {
        type: ObjectId,
        required: false,
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
