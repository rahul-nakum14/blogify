const userModel = require('../models/user'); // Import your user model

async function ensureEmailVerified(req, res, next) {
  try {
    // Retrieve the user from the database based on user ID or any other identifier
    const user = await userModel.findById(req.user._id); // Assuming req.user contains user information
    
    // Check if the user exists and their email is verified
    if (!user || !user.isEmailVerified) {
      return res.render("notEmailVerify");
    }
    
    // If the user is verified, proceed to the next middleware/route handler
    next();
  } catch (error) {
    // Handle any errors that occur during database query
    console.error("Error in ensureEmailVerified middleware:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  ensureEmailVerified,
};
