const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "blogModel",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "userModel",
    },
  },
  { timestamps: true }
);

const commentmodels = model("commentModel", commentSchema);

module.exports = commentmodels;
