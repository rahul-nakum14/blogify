const userModel = require("../models/user");
const { createTokenForUser } = require("../utills/jwt_token");
const bcrypt = require("bcrypt");

const signin_get = (req, res) => {
  res.render("signin");
};

const signup_get = (req, res) => {
  res.render("signup");
};
const signup_post = async (req, res) => {
  const data = req.body;

  try {
    const existingUser = await userModel.findOne({ email: data.emailInput });

    if (existingUser) {
      return res.json({ Error: "User Already Exists" });
    }

    if (!data.emailInput || !data.fullnameInput || !data.passwordInput) {
      return res.json({ Error: "All fields are required" });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(data.passwordInput, 10);

    const newUser = new userModel({
      email: data.emailInput,
      fullname: data.fullnameInput,
      password: hashedPassword, // Store the hashed password in the database
    });

    const result = await newUser.save();
    res.redirect("/users/signin");
  } catch (error) {
    return res.json({ Error: "Error Occurred", error });
  }
};

const signin_post = async (req, res) => {
  try {
    const { emailSigninInput, passwordSignInput } = req.body;

    const user = await userModel.findOne({ email: emailSigninInput });

    if (!user) {
      return res.render("signin", {
        error: "Invalid email or password",
      });
    }

    // Compare the input password with the stored hashed password
    const passwordMatch = await bcrypt.compare(
      passwordSignInput,
      user.password
    );

    if (!passwordMatch) {
      return res.render("signin", {
        error: "Invalid email or password",
      });
    }

    const token = createTokenForUser(user);
    // Passwords match, login successful
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    console.error("Error occurred during login:", error);
    return res.status(500).json({ error: "Error occurred during login" });
  }
};

const user_logout = (req, res) => {
  res.clearCookie("token");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.redirect("/users/signin");
};

module.exports = {
  signin_get,
  signin_post,
  signup_get,
  signup_post,
  user_logout,
};
