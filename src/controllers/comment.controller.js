const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { comment, post } = prisma;

/**
 * Adds a comment to a post.
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 */
async function addComment(req, res) {
  const { content, date } = req.body;
  const slug = req.params.id; // Assumes `id` is the post slug
  const userId = req.user_id; // Assumes user ID is extracted from a middleware

  try {
    // Check if the post exists
    const existingPost = await post.findUnique({
      where: { slug },
    });

    if (!existingPost) {
      return res.status(404).json({
        status: 0,
        msg: "Post not found",
      });
    }

    // Create the new comment
    const newComment = await comment.create({
      data: {
        content,
        date: date || new Date(), // Use current date if not provided
        authorId: userId,
        postId: existingPost.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            userName: true,
            profileImageURL: true,
          },
        },
      },
    });

    return res.status(201).json({
      status: 1,
      msg: "Commentaire ajouté avec succès",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ status: 0, msg: `Erreur du serveur: ${error.message}` });
  }
}

/**
 * Deletes a comment.
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 */
async function deleteComment(req, res) {
  const commentId = parseInt(req.params.id, 10);
  const userId = req.user_id;

  try {
    // Check if the comment exists
    const commentToDelete = await comment.findUnique({
      where: { id: commentId },
      include: { author: true },
    });

    if (!commentToDelete) {
      return res.status(404).json({ msg: "Commentaire non trouvé" });
    }

    // Check if the user is authorized to delete the comment
    if (commentToDelete.author.id !== userId) {
      return res.status(403).json({ msg: "Non autorisé" });
    }

    // Delete the comment
    await comment.delete({
      where: { id: commentId },
    });

    return res.status(200).json({ msg: "Commentaire supprimé avec succès" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ msg: `Erreur du serveur: ${error.message}` });
  }
}

module.exports = {
  addComment,
  deleteComment,
};
