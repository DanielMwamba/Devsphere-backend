const express = require("express");
//controllers
const userController = require("../controllers/user.controller");

//Middlewares
const { verifyToken } = require("../middlewares/verifyToken.middleware");

const userRouter = express.Router();

//Public
userRouter.get("/username/:username", userController.getUserByUsername);

//Auth
userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);
userRouter.post("/refreshToken", userController.refreshToken);

//Protected
userRouter.get("/", verifyToken, userController.User);
userRouter.get("/all", verifyToken, userController.getAllUsers);
userRouter.put("/", verifyToken, userController.updateUser);
userRouter.put("/password", verifyToken, userController.resetPassword);
userRouter.put("/profileImage", verifyToken, userController.updateProfileImage);

module.exports = userRouter;
