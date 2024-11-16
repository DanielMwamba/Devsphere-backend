const express = require("express");
const cors = require("cors");

const userRouter = require("./routes/user.routes");
const postRouter = require("./routes/post.routes");
const commentRouter = require("./routes/comment.routes");

/*** GENERAL SETUP ****/
const app = express();
const PORT = process.env.PORT || 3000;

// Configuration des options CORS
const corsOption = {
  origin: "https://kongodev.vercel.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware CORS global
app.use(cors(corsOption));

// Middleware pour gérer les requêtes préliminaires (OPTIONS)
app.options("*", cors(corsOption));

// En-têtes de réponse pour toutes les requêtes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://kongodev.vercel.app");
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
