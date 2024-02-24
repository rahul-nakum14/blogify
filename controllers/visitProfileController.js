const userModel = require("../models/user");
const mongoose = require('mongoose');

const displayData = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send('Invalid ObjectId');
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const publicBlogs = await Blog.find({
      createdBy: user._id,
      isPrivate: false,
    }).exec();

    return res.render("visitProfile", { user, publicBlogs });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  displayData,
};
