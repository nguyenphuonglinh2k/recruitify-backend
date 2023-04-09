const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    virtuals: true,
    versionKey: false,
  },
);

schema.virtual("id", {
  id: this.id,
});

const Tag = mongoose.model("Tag", schema, "tags");

module.exports = Tag;
