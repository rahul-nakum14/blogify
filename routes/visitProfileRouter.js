const { Router } = require("express");
const {
  displayData,
  followUser,
  displayNotifications,
} = require("../controllers/visitProfileController");

const visitProfileRouter = Router();

visitProfileRouter.get("/:fullName", displayData);
visitProfileRouter.get("/notify/:notifications", displayNotifications);
visitProfileRouter.post("/:userId/follow", followUser);

module.exports = visitProfileRouter;
