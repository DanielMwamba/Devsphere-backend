const express = require("express");

const commentController = require("../controllers/comment.controller");

const { verifyToken } = require("../middlewares/verifyToken.middleware");

const commentRouter = express.Router();

//Protected
commentRouter.post("/:id", verifyToken, commentController.addComment);

module.exports = commentRouter;
