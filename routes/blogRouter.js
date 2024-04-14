const { Router } = require("express");
const {
  addBlog_get,
  addBlog_post,
  list_blogs,
  like_blog,
  addBookmark,
  removeBookmark,
  editBlog_get,
  editBlog_post,
  deleteBlog_post
} = require("../controllers/blogController");

const blogRouter = Router();
blogRouter.get("/edit/:id", editBlog_get);
blogRouter.post("/edit/:id", editBlog_post);
blogRouter.post("/delete/:id", deleteBlog_post);
blogRouter.get("/add-new", addBlog_get);
blogRouter.post("/add-new", addBlog_post);
blogRouter.post("/:id/like", like_blog);
blogRouter.post("/:id/bookmark", addBookmark);
blogRouter.get("/:id", list_blogs);
blogRouter.delete("/:id/bookmark", removeBookmark); 

module.exports = blogRouter;
