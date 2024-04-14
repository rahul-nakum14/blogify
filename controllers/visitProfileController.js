const userModel = require("../models/user");
const blogModel = require("../models/blog");
const mongoose = require("mongoose");

const displayData = async (req, res) => {
  try {
    const fullName = req.params.fullName;

    if (!fullName) {
      return res.status(400).send("Full name is required");
    }
    const fullNameRegex = new RegExp(fullName, "i");

    const user = await userModel.findOne({ fullname: fullNameRegex });

    if (!user) {
      return res.status(404).send("User not found");
    }

    let blogsQuery = { createdBy: user._id };

    // Check if req.user exists and has the necessary properties
    if (req.user && req.user.following && Array.isArray(req.user.following)) {
      if (req.user.following.includes(user._id)) {
        blogsQuery = {
          createdBy: user._id,
          $or: [{ isPrivate: false }, { isPrivate: true }],
        };
      } else {
        blogsQuery.isPrivate = false;
      }
    } else {
      blogsQuery.isPrivate = false;
    }

    const blogs = await blogModel.find(blogsQuery).exec();
    const profileImageURL = user.profileImageURL;

    return res.render("visitProfile", {
      user,
      blogs,
      profileImageURL,
      loggedInUser: req.user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

const followUser = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const targetUserId = req.params.userId;

    console.log(
      "Requesting to follow user:",
      loggedInUserId,
      "Target user:",
      targetUserId
    );

    if (loggedInUserId === targetUserId) {
      console.log("follow yourself");
      return res.status(400).json({ error: "You can't follow yourself" });
    }

    const loggedInUser = await userModel.findById(loggedInUserId);
    const targetUser = await userModel.findById(targetUserId);

    // Check if the target user has notifications and a pending follow request from the logged-in user
    const hasExistingRequest =
      targetUser.notifications &&
      targetUser.notifications.some(
        (notification) =>
          notification &&
          notification.sender &&
          notification.sender.toString() === loggedInUserId &&
          notification.type === "followRequest"
      );

    if (hasExistingRequest) {
      return res.json({ success: true, isFollowing: false, isRequested: true });
    }

    if (loggedInUser.following.includes(targetUserId)) {
      return res.json({
        success: true,
        followersCount: targetUser.followers.length,
        isFollowing: true,
        isRequested: false,
      });
    }

    const followRequestNotification = {
      sender: loggedInUserId,
      receiver: targetUserId,
      type: "followRequest",
      createdAt: new Date(),
    };

    targetUser.notifications = targetUser.notifications || [];
    targetUser.notifications.push(followRequestNotification);
    await targetUser.save();
    console.log("Follow request notification:", followRequestNotification);

    res.json({ success: true, isFollowing: false, isRequested: true });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const displayNotifications = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .populate("notifications.sender", "fullname") // Populate the sender field
      .populate("notifications.receiver", "fullname"); // Populate the receiver field

    return res.render("notifications", { user });
  } catch (error) {
    console.error("Error displaying notifications:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  displayData,
  followUser,
  displayNotifications,
};
