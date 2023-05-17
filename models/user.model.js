const mongoose = require("mongoose");
const { Schema } = mongoose;

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
    applicationIds: [
      {
        type: Schema.Types.ObjectId,
        required: false,
        ref: "Application",
      },
    ],
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

// schema.pre("deleteMany", function (next) {
//   const user = this;
//   user.model("Task").deleteOne({ assigneeId: user._id }, next);
// });

const User = mongoose.model("User", schema, "users");

module.exports = User;
