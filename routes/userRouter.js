const { Router } = require("express");
const {
  signin_get,
  signup_get,
  signin_post,
  signup_post,
  user_logout,
} = require("../controllers/userController");
const { getBookmarks,removeBookmark,toggleBookmark } = require("../controllers/blogController");

const userRouter = Router();

userRouter.get("/signin", signin_get);
userRouter.get("/signup", signup_get);
userRouter.get("/bookmark", getBookmarks);
// userRouter.post("/users/toggleBookmark/:id", toggleBookmark);
// userRouter.post("/users/removeBookmark/:blogId", removeBookmark);
userRouter.post("/signin", signin_post);
userRouter.post("/signup", signup_post);
userRouter.get("/logout", user_logout);

module.exports = userRouter;
