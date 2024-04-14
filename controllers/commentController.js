const commentModel = require("../models/comment");

const add_comment = async (req, res) => {
  await commentModel.create({
    content: req.body.content,
    blogId: req.params.blogid,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogid}`);
};

const update_comment = async (req, res) => {
  try {
    const { commentid } = req.params;
    const { editedContent } = req.body;
    console.log(commentid);

    if (!commentid || !editedContent) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields." });
    }

    // Ensure user owns the comment
    const comment = await commentModel.findById(commentid);
    if (!comment || !comment.createdBy.equals(req.user._id)) {
      return res.status(403).json({ error: "Unauthorized to update comment." });
    }

    // Update comment
    await commentModel.findByIdAndUpdate(
      commentid,
      { content: editedContent },
      { new: true }
    );

    res.json({ message: "Comment updated successfully.", editedContent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const delete_comment = async (req, res) => {
  try {
    const { commentid } = req.params;
    console.log(req.params);
    const comment = await commentModel
      .findById(commentid)
      .populate("createdBy");

    // Ensure authorization to delete
    if (!comment || !comment.createdBy.equals(req.user._id)) {
      return res.status(403).json({ error: "Unauthorized to delete comment." });
    }

    await commentModel.findByIdAndDelete(commentid);
    res.json({ message: "Comment deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { add_comment, update_comment, delete_comment };
