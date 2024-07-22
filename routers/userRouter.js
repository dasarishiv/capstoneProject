const express = require("express");
const {
  getUserByIdHandler,
  getUsersHandler,
  deleteUserByIdHandler,
  updateUserByIdHandler
} = require("../controllers/userController");
const { isAdmin, protectRoute } = require("../controllers/authController");

const userRouter = express.Router();
userRouter.use(protectRoute); // adding authentication middleware for all user routes

userRouter.get("/allUsers", isAdmin, getUsersHandler);
userRouter.get("/:id", getUserByIdHandler);
userRouter.patch("/:id", updateUserByIdHandler);
userRouter.delete("/:id", deleteUserByIdHandler);

module.exports = userRouter;
