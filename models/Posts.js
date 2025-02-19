const mongoose = require("mongoose");

const PostsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },
    txtUrl: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);
PostsSchema.index({ name: "text" });
module.exports = mongoose.model("Post", PostsSchema);
