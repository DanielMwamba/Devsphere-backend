const { PrismaClient } = require("@prisma/client");
const cloudinary = require("../utils/cloudinary");
const { slugifyUpdate, slugify } = require("../utils/slugify");

const { user, post } = new PrismaClient();

async function getAllPosts(req, res) {
  try {
    const posts = await post.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        summary: true,
        slug: true,
        imageURL: true,
        date: true,
        author: {
          select: {
            name: true,
            userName: true,
          },
        },
      },
    });
    if (posts.length === 0) {
      return res.status(404).json({ posts: [] });
    }

    return res.status(200).json({ posts });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

async function getUserAllPosts(req, res) {
  try {
    const userId = req.user_id;

    const posts = await post.findMany({
      where: {
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            userName: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    if (posts.length === 0) {
      return res.status(200).json({ posts: [] });
    }

    return res.status(200).json({ posts });
  } catch (error) {
    return res.status(500).json({ msg: "Internal server error" });
  }
}

async function addPost(req, res) {
  try {
    // User ID coming from decoding the JWT token
    const userId = req.user_id;

    // Cloudinary ID & URL declarations
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.body.imageURL
    );
    const cloudinaryId = public_id;
    const imageURL = secure_url;

    // Data Declaration Coming From Frontend through FORM-DATA
    const { title, category, summary, description, date } = req.body;

    // Validation
    if (!title || typeof title !== "string") {
      return res.status(400).json({ msg: "Invalid title" });
    }

    if (!category || typeof category !== "string") {
      return res.status(400).json({ msg: "Invalid Category" });
    }

    if (!summary || typeof summary !== "string") {
      return res.status(400).json({ msg: "Invalid summary" });
    }

    if (!description || typeof description !== "string") {
      return res.status(400).json({ msg: "Invalid description" });
    }

    if (!imageURL || typeof imageURL !== "string") {
      return res.status(400).json({ msg: "Invalid imageURL" });
    }

    if (!cloudinaryId || typeof cloudinaryId !== "string") {
      return res.status(400).json({ msg: "Invalid cloudinaryId" });
    }

    if (!date) {
      return res.status(400).json({ msg: "Invalid date" });
    }

    // if (!userId || typeof userId !== "string") {
    //   return res.status(400).json({ msg: "Invalid userId" });
    // }

    // Check if user exists
    const users = await user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!users) {
      return res.status(404).json({ msg: "User not found." });
    }

    // Generate slug
    const slug = slugify(title);

    // Create post
    const newPost = await post.create({
      data: {
        title: title,
        category: category,
        summary: summary,
        description: description,
        slug: slug,
        date: date,
        imageURL: imageURL,
        cloudinaryId: cloudinaryId,
        authorId: userId,
      },
    });

    return res.status(201).json({ msg: "Post created successfully", newPost });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server Error", error: error.message });
  }
}

async function updatePost(req, res) {
  try {
    const userId = req.user_id;
    const postId = parseInt(req.params.id);

    const { title, category, summary, description, imageURL } = req.body;

    const posts = await post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!posts) {
      return res.status(404).json({ msg: "Post not found" });
    }

    if (posts.authorId !== userId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    await cloudinary.uploader.destroy(posts.cloudinaryId);

    const { public_id, secure_url } = await cloudinary.uploader.upload(
      imageURL
    );
    const newCloudinaryId = public_id;
    const newImageURL = secure_url;

    // Vérifie et valide les données
    if (!title || typeof title !== "string") {
      return res.status(400).json({ msg: "Invalid title" });
    }

    if (!category || typeof category !== "string") {
      return res.status(400).json({ msg: "Invalid Category" });
    }

    if (!summary || typeof summary !== "string") {
      return res.status(400).json({ msg: "Invalid summary" });
    }

    if (!description || typeof description !== "string") {
      return res.status(400).json({ msg: "Invalid description" });
    }

    if (!newImageURL || typeof newImageURL !== "string") {
      return res.status(400).json({ msg: "Invalid imageURL" });
    }

    if (!newCloudinaryId || typeof newCloudinaryId !== "string") {
      return res.status(400).json({ msg: "Invalid cloudinary_id" });
    }

    // Génère un nouveau slug
    const newSlug = slugifyUpdate(title, posts.slug);

    const updatedPost = await post.update({
      where: {
        id: postId,
      },
      data: {
        title: title,
        category: category,
        summary: summary,
        description: description,
        slug: newSlug,
        date: posts.date,
        imageURL: newImageURL,
        cloudinaryId: newCloudinaryId,
        authorId: userId,
      },
    });

    return res
      .status(200)
      .json({ msg: "Post updated successfully", data: updatedPost });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: error.message });
  }
}

async function getUserPost(req, res) {
  try {
    const userId = req.user_id;
    const postId = req.params.id;

    const posts = await post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
      },
    });

    if (!posts) {
      return res.status(404).json({ msg: "Post not found" });
    }

    if (posts.authorId !== userId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    return res.status(200).json({ post });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: error.message });
  }
}

async function getPost(req, res) {
  try {
    const slug = req.params.slug;
    const posts = await post.findFirst({
      where: {
        slug: slug,
      },
      include: {
        author: {
          select: {
            userName: true,
            name: true,
            profileImageURL: true,
          },
        },
      },
    });

    if (!posts) {
      return res.status(404).json({ msg: "Post not found" });
    }

    return res.status(200).json({ posts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: error.message });
  }
}

async function deletePost(req, res) {
  try {
    const id = parseInt(req.params.id);
    const jwtUserId = req.user_id;

    if (!id || isNaN(id)) {
      return res.status(400).json({ msg: "L'identifiant est requis" });
    }

    const posts = await post.findUnique({
      where: {
        id: id,
      },
      include: {
        author: true,
      },
    });

    if (!posts) {
      return res.status(400).json({ msg: "Publication non trouvée" });
    }

    if (posts.author.id !== jwtUserId) {
      return res.status(401).json({ msg: "Non autorisé" });
    }

    await post.delete({
      where: {
        id: id,
      },
    });

    return res.status(200).json({ msg: "Publication supprimée avec succès" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

module.exports = {
  addPost,
  getUserAllPosts,
  getAllPosts,
  updatePost,
  getPost,
  getUserPost,
  deletePost,
};
