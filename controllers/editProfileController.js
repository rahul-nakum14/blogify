const multer = require("multer");
const path = require("path");
const express = require("express");
const app = express();
const userModel = require("../models/user");
// const { generateSalt, hashPassword } = require("../utills/passwordUtils");
const bcrypt = require("bcrypt");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/upload")); // Ensure correct path
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${req.user.fullname}-${file.originalname}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .png, .jpg and .jpeg files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const editProfileControllerGet = (req, res) => {
  const user = req.user; // Ensure correct user object access
  return res.render("editProfile", {
    user,
  });
};

const editProfileControllerPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullname, email, password } = req.body;

    // Find the user in the database
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Handle file upload if provided
    if (req.file) {
      user.profileImageURL = `/upload/${req.file.filename}`;
      req.user.profileImageURL = user.profileImageURL; // Update session data
    }

    // Update full name if provided
    if (fullname) {
      user.fullname = fullname;
      req.user.fullname = fullname; // Update session data immediately
      console.log('this is test',req.user.fullname);
    }

    // Update email if provided
    if (email) {
      user.email = email;
    }

    // Update password if provided
    if (password) {
      // Hash the new password using bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Save the updated user to the database
    await user.save();

    return res.redirect("/users/editProfile");
  } catch (error) {
    console.error("Error updating profile:", error.message);
    return res.status(500).send("Internal Server Error");
  }
};


module.exports = {
  editProfileControllerGet,
  editProfileControllerPost,
  upload
};

// const multer = require("multer");
// const path = require("path");
// const userModel = require("../models/user");
// const { generateSalt, hashPassword } = require("../utills/passwordUtils");

// const editProfileControllerGet = (req, res) => {
//   const user = req.user;
//   return res.render("editProfile", {
//     user: req.user,
//   });
// };

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.resolve("./public/upload"));
//   },
//   filename: function (req, file, cb) {
//     const fileName = `${Date.now()}-${req.user.fullname}-${file.originalname}`;
//     cb(null, fileName);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true); // Accept the file
//   } else {
//     cb(new Error("Only .png, .jpg and .jpeg files are allowed!"), false); // Reject the file
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
// });

// const editProfileControllerPost = async (req, res) => {
//   try {
//     const user = req.user;
//     const data = req.body;

//     // Update user's name if provided
//     if (data.fullname) {
//       user.fullname = data.fullname;
//     }

//     // Update user's password if provided
//     if (data.password) {
//       const salt = generateSalt();
//       const hashedPassword = hashPassword(data.password, salt);
//       user.password = hashedPassword;
//       user.salt = salt;
//     }

//     // Save the updated user
//     await user.save();

//     return res.redirect("/profile"); // Redirect to the profile page or any other desired page
//   } catch (error) {
//     console.error("Error updating profile:", error.message);
//     return res.status(500).send("Internal Server Error");
//   }
// };

// module.exports = {
//   editProfileControllerGet,
//   editProfileControllerPost,
// };
