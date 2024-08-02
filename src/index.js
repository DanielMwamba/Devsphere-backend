const express = require("express");
const cors = require("cors");

const userRouter = require("./routes/user.routes");
const postRouter = require("./routes/post.routes");
const commentRouter = require("./routes/comment.routes");

/***  GENERAL SETUP ****/

const app = express();
const PORT = process.env.PORT || 3000;
const corsOption = {
  origin: "*",
};

app.use(express.json());
app.use(cors(corsOption));
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

/***  ROUTES ****/

app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/comment", commentRouter);

/***  RUN SERVER ****/

app.listen(PORT, () => {
  console.log(`he server listens on http:/localhost:${PORT}`);
});
