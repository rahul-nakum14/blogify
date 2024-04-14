const { Router } = require("express");
const {
  signin_get,
  signup_get,
  signin_post,
  signup_post,
  user_logout,
  verifyemail,
  verifyEmail_get,
  forgotpass_get,
  forgotpass_post,
  resetpass_get,
  resetpass_post,
} = require("../controllers/userController");
const {
  getBookmarks,
  removeBookmark,
  toggleBookmark,
} = require("../controllers/blogController");

const userRouter = Router();
userRouter.get("/reset/reset-password/:token", resetpass_get);
userRouter.post("/reset/reset-password/:token", resetpass_post);
userRouter.get("/signin", signin_get);
userRouter.get("/signup", signup_get);
userRouter.get("/bookmark", getBookmarks);
userRouter.post("/signin", signin_post);
userRouter.post("/signup", signup_post);
userRouter.get("/logout", user_logout);
userRouter.get("/email/verify-email", verifyemail);
userRouter.get("/verifyEmail/:token", verifyEmail_get);
userRouter.get("/forgot-password", forgotpass_get);
userRouter.post("/forgot-password", forgotpass_post);

module.exports = userRouter;

// userRouter.post("/users/toggleBookmark/:id", toggleBookmark);
// userRouter.post("/users/removeBookmark/:blogId", removeBookmark);
