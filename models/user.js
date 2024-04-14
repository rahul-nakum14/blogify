const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    token:{
      type: String
    },
    resetPasswordToken:{
      type: String
    },
    profileImageURL: {
      type: String,
      default: "/images/userDefaultAvatar.jpeg",
    },
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "blogModel", // Reference to the Blog model
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel",
      },
    ],
    notifications: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "userModel",
        },
        receiver: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "userModel",
        },
        type: String,
        createdAt: Date,
      },
    ],
    isEmailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("userModel", userSchema);

module.exports = User;

// userSchema.pre("save", function (next) {
//   const user = this;
//   if (!user.isModified("password")) {
//     return next();
//   }
//   try {
//     const salt = generateSalt();
//     const hashedPassword = hashPassword(user.password, salt);
//     user.password = hashedPassword;
//     user.salt = salt;
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// userSchema.methods.comparePassword = async function (candidatePassword) {
//   try {
//     const user = this;
//     if (!user.salt || !user.password) {
//       throw new Error("Salt or password missing");
//     }
//     const hashedPassword = hashPassword(candidatePassword, user.salt);

//     if (!hashedPassword) {
//       throw new Error("Hashed password generation failed");
//     }

//     return hashedPassword === user.password;
//   } catch (error) {
//     console.error("Error comparing passwords:", error.message);
//     throw new Error("Error comparing passwords");
//   }
// };
