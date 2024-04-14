const blogModel = require("../models/blog");
const commentModel = require("../models/comment");
const userModel = require("../models/user");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");

const editBlog_get = async (req, res) => {
  try {
    // Find the blog by ID
    const blog = await blogModel.findById(req.params.id);
    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    // Render the edit form with the blog data
    res.render("editBlog", { blog, user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const editBlog_post = async (req, res) => {
  upload.single("blogCoverImage")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }
    try {
      const { title, body, privatePost } = req.body;
      const isPrivate = privatePost === "on"; // Convert 'on' string to boolean
      
      // Check if a new image was uploaded
      let newCoverImageUrl;
      if (req.file) {
        newCoverImageUrl = `/upload/${req.file.filename}`;
        console.log('New image URL:', newCoverImageUrl);
      }
      
      // Find the existing blog post by ID
      const existingBlog = await blogModel.findById(req.params.id);

      if (!existingBlog) {
        return res.status(404).send("Blog not found");
      }

      // Update the blog post details
      existingBlog.title = title;
      existingBlog.body = body;
      existingBlog.isPrivate = isPrivate;
      
      // Update the cover image URL if a new image was uploaded
      if (newCoverImageUrl) {
        existingBlog.coverImageUrl = newCoverImageUrl;
      }

      // Save the updated blog post
      const updatedBlog = await existingBlog.save();
      
      // Redirect to the updated blog post
      res.redirect(`/blog/${updatedBlog._id}`);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });
};

const deleteBlog_post = async (req, res) => {
  try {
    const blogId = req.params.id;
    // Find the blog post by ID and delete it
    const deletedBlog = await blogModel.findByIdAndDelete(blogId);
    if (!deletedBlog) {
      return res.status(404).send("Blog not found");
    }
    // Optionally, you can do some additional actions after deletion, like redirecting to a specific page
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const removeBookmark = async (req, res) => {
  try {
    const blogId = req.params.id;

    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Fetch the user to check permissions
    const user = await userModel.findById(req.user._id);

    // Remove the blog ID from the bookmarks array in the userModel
    user.bookmarks.pull(blogId);

    // Save the user model
    const updatedUser = await user.save();

    res.json({
      success: true,
      message: "Bookmark removed successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addBlog_get = (req, res) => {
  res.render("addBlog", {
    user: req.user,
  });
};

const getBookmarks = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Use the correct model (userModel) to fetch the user and populate bookmarks
    const user = await userModel.findById(userId).populate({
      path: "bookmarks",
      populate: {
        path: "createdBy",
        select: "fullname profileImageURL",
      },
      select: "title body createdAt coverImageUrl",
    });

    const formattedBookmarks = user.bookmarks.map((bookmark) => {
      return {
        ...bookmark.toObject(),
        createdAt: formatDate(bookmark.createdAt),
      };
    });

    res.render("bookmarks", {
      userWithBookmarks: formattedBookmarks,
      locals: { user: req.user },
    });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addBookmark = async (req, res) => {
  try {
    const blogId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res.status(400).json({ error: "Invalid blog ID" });
    }

    // Find the blog
    const blog = await blogModel
      .findById(blogId)
      .populate("createdBy", "profileImageURL fullName");
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Ensure user is authenticated and authorized
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Fetch the user to check permissions
    const user = await userModel.findById(req.user._id);

    // Toggle bookmark in blogModel
    const isBookmarked = blog.bookmarks.includes(req.user._id);
    if (isBookmarked) {
      blog.bookmarks.pull(req.user._id);
    } else {
      blog.bookmarks.push(req.user._id);
    }

    // Toggle bookmark in userModel
    const userIsBookmarked = user.bookmarks.includes(blog._id);
    if (userIsBookmarked) {
      user.bookmarks.pull(blog._id);
    } else {
      user.bookmarks.push(blog._id);
    }

    // Save both the blog and user models
    const updatedBlog = await blog.save();
    const updatedUser = await user.save();

    res.json({
      bookmarks: updatedBlog.bookmarks,
      isBookmarked: !isBookmarked, // Inverted to reflect the new state
      blog: {
        _id: updatedBlog._id,
        title: updatedBlog.title,
        body: updatedBlog.body,
        coverImageUrl: updatedBlog.coverImageUrl,
        createdAt: updatedBlog.createdAt,
        createdBy: {
          _id: updatedBlog.createdBy._id,
          profileImageURL: updatedBlog.createdBy.profileImageURL,
          fullname: updatedBlog.createdBy.fullname,
        },
      },
    });
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("en-US", options);
}

const list_blogs = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await blogModel.findById(blogId).populate("createdBy");
    const comments = await commentModel
      .find({ blogId: req.params.id })
      .populate("createdBy");

    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    // Fetch the likes count for the blog
    const likesCount = blog.likes.length;

    if (blog.isPrivate && (!req.user || !blog.createdBy.equals(req.user._id))) {
      return res.status(403).send("Unauthorized");
    }

    // Format the blog creation date
    blog.createdAtFormatted = formatDate(blog.createdAt);

    res.render("blog", {
      blog,
      comments,
      likesCount,
      locals: { user: req.user },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const like_blog = async (req, res) => {
  const blogId = req.params.id;

  try {
    const blog = await blogModel.findById(blogId);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    const userId = req.user._id;

    if (blog.likes.includes(userId)) {
      blog.likes.pull(userId);
    } else {
      blog.likes.push(userId);
    }

    await blog.save();

    res.json({
      likes: blog.likes,
      isLiked: blog.likes.includes(userId),
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("this is path hackeddddd", path.resolve("./public/upload"));
    // this is path hackeddddd C:\Users\rahul\Desktop\Moon Technolabs\blogify\public\upload
    cb(null, path.resolve("./public/upload"));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only .png, .jpg and .jpeg files are allowed!"), false); // Reject the file
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

const addBlog_post = async (req, res) => {
  upload.single("blogCoverImage")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Please upload a file" });
    }
    try {
      const { blogTitle, blogBody, privatePost } = req.body;

      const blog = new blogModel({
        title: blogTitle,
        body: blogBody,
        createdBy: req.user._id,
        coverImageUrl: `/upload/${req.file.filename}`,
        isPrivate: privatePost === "on",
      });

      const result = await blog.save();
      return res.redirect(`/blog/${blog._id}`);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
};

module.exports = {
  addBlog_get,
  addBlog_post,
  list_blogs,
  like_blog,
  getBookmarks,
  addBookmark,
  removeBookmark,
  editBlog_get,
  editBlog_post,
  deleteBlog_post
};

//Custom Promises
// const addBlog_post = async(req,res) =>{

//     const uploadfilepromises = () =>{
//         return new Promise((resolve,reject) =>{
//             upload.single('blogCoverImage')(req,res,(err) =>{
//                 if (err instanceof multer.MulterError) {
//                     reject(err);
//                 } else if (err) {
//                     reject(err);
//                 }else{
//                     if (!req.file) {
//                         reject(new Error('Please upload a file'));
//                     } else {
//                         resolve(req.file);
//                     }
//                 }
//             })
//         })
//     };
//     try {

//         const handlePromise = await uploadfilepromises();
//         const { blogTitle, blogBody } = req.body;

//         const blog = new blogModel({
//             title: blogTitle,
//             body: blogBody,
//             createdBy: req.user._id,
//             coverImageUrl: `/upload/${handlePromise.filename}`
//         });

//         const result = await blog.save();
//         return res.redirect('/');

//     }catch(error){
//         if (error instanceof multer.MulterError) {
//             return res.status(500).json({ error: error.message });
//         } else {
//             return res.status(500).json({ error: error.message });
//         }
//     }

// }

// With promisify service works
// const { promisify } = require('util');
// const uploadPromise = promisify(upload.single('blogCoverImage'));

// const addBlog_post = async (req, res) => {
//     try {
//         const uploadResult = await uploadPromise(req, res);

//         if (!req.file) {
//             return res.status(400).json({ error: 'Please upload a file' });
//         }

//         const { blogTitle, blogBody } = req.body;

//         const blog = new blogModel({
//             title: blogTitle,
//             body: blogBody,
//             createdBy: req.user._id,
//             coverImageUrl: `/upload/${req.file.filename}`
//         });

//         const result = await blog.save();
//         return res.redirect('/');
//     } catch (error) {
//         return res.status(500).json({ error: error.message });
//     }
// };
