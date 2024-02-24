const { Router } = require("express");
const {
  editProfileControllerGet,
  editProfileControllerPost,
  upload
} = require("../controllers/editProfileController");
const editProfileRouter = Router();

editProfileRouter.get("/", editProfileControllerGet);
editProfileRouter.post("/", upload.single("updateProfilePhoto"),editProfileControllerPost);

module.exports = editProfileRouter;
