const express = require("express");
//controllers
const postController = require("../controllers/post.controller");

//Middlewares
const { verifyToken } = require("../middlewares/verifyToken.middleware");

const postRouter = express.Router();

//Public
postRouter.get("/", postController.getAllPosts);
postRouter.get("/slug/:slug", postController.getPost);
postRouter.get("/category/:category", postController.getPostsByCategory);

//Protected
postRouter.get("/user-all", verifyToken, postController.getUserAllPosts);
postRouter.post("/", verifyToken, postController.addPost);
postRouter.put("/:id", verifyToken, postController.updatePost);
postRouter.delete("/:id", verifyToken, postController.deletePost);
postRouter.post("/like/:id", verifyToken, postController.likePost);

module.exports = postRouter;
