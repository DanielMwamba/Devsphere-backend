const { PrismaClient } = require("@prisma/client");
const { comment } = new PrismaClient();

async function addComment(req, res) {
  const { content } = req.body;
  const { postId } = req.params;
  const userId = req.user_id;
  try {
    const newComment = await comment.create({
      data: {
        content: content,
        date: new Date(),
        author: userId,
        post: postId,
      },
    });
    return res
      .status(201)
      .json({
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


module.exports = {
    addComment
};