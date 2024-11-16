const express = require("express");
const cors = require("cors");

const userRouter = require("./routes/user.routes");
const postRouter = require("./routes/post.routes");
const commentRouter = require("./routes/comment.routes");

/*** GENERAL SETUP ****/
const app = express();
const PORT = process.env.PORT || 3000;
const corsOption = {
  origin: "https://kongodev.vercel.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({limit: "50mb", extended: true}));



app.use(express.json());
app.use(cors(corsOption));
app.options("*", cors(corsOption)); // Pour gérer les requêtes préliminaires

/*** ROUTES ****/
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/comment", commentRouter);

/*** RUN SERVER ****/
app.listen(PORT, () => {
  console.log(`The server listens on http://localhost:${PORT}`);
});
