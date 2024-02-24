const { Router } = require("express");
const {
  addBlog_get,
  addBlog_post,
  list_blogs,
  like_blog,
  addBookmark
} = require("../controllers/blogController");

const blogRouter = Router();

blogRouter.get("/add-new", addBlog_get); 
blogRouter.post("/add-new", addBlog_post);
blogRouter.post("/:id/like", like_blog);
blogRouter.post("/:id/bookmark", addBookmark);
blogRouter.get("/:id", list_blogs);

module.exports = blogRouter;
