const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {hashedPassword, cloudinary} = require("../utils/utils")

const { user } = new PrismaClient();

//Récupération des données de l'utilisateur par son username

async function getUserByUsername(req, res) {
  try {
    const { username } = req.params;
    const users = await user.findUnique({
      where: {
        userName: username,
      },
      include: {
        posts: {
          include: {
            comments: true,
            author: true,
          },
        },
      },
    });
    if (!users) {
      return res
        .status(404)
        .json({ status: 0, msg: "Utilisateur non trouvé." });
    }

    const { password, ...userData } = users;

    return res
      .status(200)
      .json({ status: 1, msg: "Utilisateur trouvé.", user: userData });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 0, msg: `Erreur du serveur : ${error.message}` });
  }
}

//Inscription d'un nouvel utilisateur

async function register(req, res) {
  try {
    const { name, email, username, password } = req.body;

    // Vérification de l'existence de l'email et du nom d'utilisateur
    const existingUser = await user.findFirst({
      where: {
        OR: [{ email: email }, { userName: username }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        status: 0,
        msg: "L'email ou le nom d'utilisateur est déjà utilisé.",
      });
    }

    // Hash du mot de passe
    const passwordHash = hashedPassword(password);

    // Création d'un nouvel utilisateur
    const newUser = await user.create({
      data: {
        name: name,
        email: email,
        userName: username,
        password: passwordHash,
        profileImageURL:
          "https://res.cloudinary.com/dqbduuqel/image/upload/v1715241630/profile-icon-design-free-vector_sghprc.jpg",
      },
    });

    // Création et envoi du token d'authentification
    const token = jwt.sign({ user_id: newUser.id }, process.env.SECRET_KEY, {
      expiresIn: "2h",
    });
    const refreshToken = jwt.sign(
      { user_id: newUser.id },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    return res
      .status(201)
      .json({ status: 1, msg: "Enregistrement réussi.", token, refreshToken });
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      status: 0,
      msg: "Échec lors de l'enregistrement de l'utilisateur",
    });
  }
}

//Connexion d'un utilisateur

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Recherche de l'utilisateur par email
    const users = await user.findUnique({
      where: {
        email: email,
      },
    });

    if (!users) {
      return res.status(404).json({ status: 0, msg: "Utilisateur non trouvé" });
    }

    // Vérification du mot de passe
    const passwordMatched = await bcrypt.compare(password, users.password);
    if (!passwordMatched) {
      return res.status(401).json({ status: 0, msg: "L'email ou le mot de passe est incorrect" });
    }

    // Création et envoi du token d'authentification
    const token = jwt.sign({ user_id: users.id }, process.env.SECRET_KEY, {
      expiresIn: "24h",
    });
    const refreshToken = jwt.sign(
      { user_id: users.id },
      process.env.SECRET_KEY,
      { expiresIn: "1y" }
    );

    return res
      .status(200)
      .json({ status: 1, msg: "Connexion réussie.", token, refreshToken });
  } catch (error) {
    return res.status(500).json({ status: 0, msg: error.message });
  }
}

//Récupération des données de l'utilisateur

async function User(req, res) {
  try {
    const userId = req.user_id;
    const userData = await user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userName: true,
        email: true,
        name: true,
        posts: true,
        profileImageURL: true,
      },
    });
    if (!userData) {
      return res
        .status(404)
        .json({ status: 0, msg: "Utilisateur non trouvé." });
    }

    return res
      .status(200)
      .json({ status: 1, msg: "Utilisateur trouvé.", user: userData });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 0, msg: `Erreur du serveur : ${error.message}` });
  }
}

//Récupération de tous les utilisateurs

async function getAllUsers(req, res) {
  try {
    const users = await user.findMany();
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
}

//Mise à jour des données de l'utilisateur

async function updateUser(req, res) {
  try {
    const userId = parseInt(req.user_id);
    const { userName, email, name, bio, profileImageURL } = req.body;
    const userData = { userName, email, bio, name, profileImageURL };

    // Validation du nom d'utilisateur
    const usernameExist = await user.findFirst({
      where: {
        userName: userName,
        NOT: { id: userId },
      },
    });
    if (usernameExist) {
      return res
        .status(400)
        .json({ status: 0, msg: `Le nom d'utilisateur est déjà pris.` });
    }

    const updatedUser = await user.update({
      where: { id: userId },
      data: userData,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    return res.status(200).json({
      status: 1,
      msg: "Utilisateur mis à jour avec succès:",
      updatedUser,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    return res
      .status(500)
      .json({ error: "Impossible de mettre à jour l'utilisateur" });
  }
}

//Mise à jour de l'image de profil de l'utilisateur

async function updateProfileImage(req, res) {
  try {
    const userId = req.user_id;
    // const { imageURL } = req.body;

    const users = await user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!users) {
      return res.status(404).json({ msg: "Utilisateur non trouvé." });
    }

    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.body.file.profileImage
      // console.log(req.body.file.profileImage)
    );
    const cloudinaryId = public_id;
    const imageURL = secure_url;

    const updatedUser = await user.update({
      where: { id: userId },
      data: {
        profileImageURL: imageURL,
        // cloudinaryId: cloudinaryId,
      },
    });
    if (!updatedUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    return res.status(200).json({
      status: 1,
      msg: "Utilisateur mis à jour avec succès:",
      // updatedUser,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    return res
      .status(500)
      .json({ error: "Impossible de mettre à jour l'utilisateur" });
  }
}

//Rafraîchissement du jeton d'authentification

async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(401)
        .json({ error: "Le jeton de rafraîchissement n'a pas été fourni" });
    }

    jwt.verify(refreshToken, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ error: "Jeton de rafraîchissement invalide" });
      }

      const token = jwt.sign(
        { user_id: decoded.user_id },
        process.env.SECRET_KEY,
        { expiresIn: "24h" }
      );
      const refreshToken = jwt.sign(
        { user_id: decoded.user_id },
        process.env.SECRET_KEY,
        { expiresIn: "1y" }
      );

      // Envoi du nouveau token d'accès au client
      res.json({ token, refreshToken });
    });
  } catch (error) {
    res.status(500).json({ msg: "Erreur du serveur", error: error.message });
  }
}

//Renitialisation du mot de passe de l'utilisateur

async function  resetPassword(req, res) {
  try {
    const userId = req.user_id;
    const { currentPassword, newPassword } = req.body;

    // Validation des entrées
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({
          msg: "Les champs mot de passe actuel et nouveau sont obligatoires",
        });
    }

    // Recherche de l'utilisateur
    const userRecord = await user.findUnique({
      where: { id: userId },
    });

    if (!userRecord) {
      return res
        .status(401)
        .json({ msg: "Échec de la réinitialisation du mot de passe" });
    }

    // Vérification du mot de passe actuel
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      userRecord.password
    );

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ msg: "Échec de la réinitialisation du mot de passe" });
    }

    // Hachage du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mise à jour du mot de passe
    await user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Réponse réussie
    return res
      .status(200)
      .json({ msg: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ msg: "Une erreur s'est produite. Veuillez réessayer." });
  }
}

module.exports = {
  login,
  register,
  User,
  getAllUsers,
  updateUser,
  updateProfileImage,
  refreshToken,
  getUserByUsername,
  resetPassword
};
