const express = require("express");
const path = require("path");
const User = require("./models/user");
const { connectDb } = require("./db/connect");
const cookieParser = require("cookie-parser");
const { checkForAuthentication } = require("./middlewares/authentication");
const userRouter = require("./routes/userRouter");
const blogRouter = require("./routes/blogRouter");
const blogModel = require("./models/blog");
const commentRouter = require("./routes/commentRouter");
const editProfileRouter = require("./routes/editRouter");
const visitProfileRouter = require("./routes/visitProfileRouter");

const app = express();
const PORT = 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthentication("token"));
app.use(express.static(path.join(__dirname, "public")));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use("/users", userRouter);
app.use("/blog", blogRouter);
app.use("/comment", commentRouter);
app.use("/users/editProfile", editProfileRouter);
app.use("/users/", visitProfileRouter);

app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  try {
    const allBlogs = await blogModel.find({});
    res.render("home", {
      user: req.user,
      blogs: allBlogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

const startApp = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
    console.log("DB and Server Started");
  } catch (error) {
    console.log("Error Occurred While Starting Server And Db", error);
  }
};

startApp();
