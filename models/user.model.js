const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    role: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      required: false,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    applicationIds: {
      type: Array,
      required: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false,
    timestamps: true,
  },
);

schema.virtual("id", {
  id: this.id,
});

const User = mongoose.model("User", schema, "users");

module.exports = User;
