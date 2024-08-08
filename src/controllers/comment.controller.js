const { PrismaClient } = require("@prisma/client");
const { comment } = new PrismaClient();

async function addComment(req, res) {
  const { contents, date } = req.body;
  const postId = parseInt(req.params.id);
  const userId = req.user_id;
  try {
    const newComment = await comment.create({
      data: {
        content: contents,
        date: date,
        authorId: userId,
        postId: postId,
      },
    });
    return res.status(201).json({
      status: 1,
      msg: "Commentaire ajouté avec succès",
      comment: newComment,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 0, msg: `Erreur du serveur: ${error.message}` });
  }
}

async function deleteComment(req, res) {
  const commentId = parseInt(req.params.id);
  const userId = req.user_id;

  try {
    const commentToDelete = await comment.findUnique({
      where: {
        id: commentId,
      },
      include: {
        author: true,
      },
    });

    if (!commentToDelete) {
      return res.status(400).json({ msg: "Commentaire non trouvée" });
    }

    if (commentToDelete.author.id !== userId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    await comment.delete({
      where: {
        id: commentId,
      },
    });

    return res.status(200).json({ msg: "Commentaire supprimée avec succès" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

module.exports = {
  addComment,
  deleteComment,
};
