const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  avatarUrl: {
    type: String,
    required: true,
  },
});

const schema = new mongoose.Schema(
  {
    applicantInfo: {
      type: applicantSchema,
      required: true,
    },
    status: {
      type: Number,
      required: true,
    },
    jobId: {
      type: ObjectId,
      required: true,
      ref: "Job",
    },
    attachments: {
      type: Array,
      required: true,
      default: [],
    },
    skillIds: [
      {
        type: ObjectId,
        required: false,
        ref: "Tag",
      },
    ],
    isPriority: {
      type: Boolean,
      required: false,
      default: false,
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

const Application = mongoose.model("Application", schema, "applications");

module.exports = Application;
