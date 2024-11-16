const express = require("express");
const cors = require("cors");

const userRouter = require("./routes/user.routes");
const postRouter = require("./routes/post.routes");
const commentRouter = require("./routes/comment.routes");

/*** GENERAL SETUP ****/
const app = express();
const PORT = process.env.PORT || 3000;

// Liste des origines autorisées
const allowedOrigins = [
  "https://kongodev.vercel.app",
  "https://kongodev.netlify.app",
];

// Middleware CORS avec vérification dynamique
app.use(cors({
  origin: function (origin, callback) {
    // Vérifier si l'origine de la requête est dans la liste des origines autorisées ou est undefined (cas des requêtes internes)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Middleware pour les requêtes préliminaires (OPTIONS)
app.options("*", cors());

// En-têtes de réponse supplémentaires
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Middleware pour analyser le corps des requêtes
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

/*** ROUTES ****/
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/comment", commentRouter);

/*** RUN SERVER ****/
app.listen(PORT, () => {
  console.log(`The server listens on http://localhost:${PORT}`);
});
