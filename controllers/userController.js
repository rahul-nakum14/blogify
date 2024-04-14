const userModel = require("../models/user");
const { createTokenForUser } = require("../utills/jwt_token");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

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

    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new userModel({
      email: data.emailInput,
      fullname: data.fullnameInput,
      password: hashedPassword,
      token: verificationToken,
    });

    await newUser.save();

    const verificationLink = `${process.env.BASE_URL}users/verifyEmail/${verificationToken}`;

    sendEmail(newUser.email, "Verify Your Email", verificationLink);

    res.redirect("/users/email/verify-email");
  } catch (error) {
    console.log(error);
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
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    console.error("Error occurred during login:", error);
    return res.status(500).json({ error: "Error occurred during login" });
  }
};

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "hanonymous371@gmail.com",
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const verifyEmail_get = async (req, res) => {
  const token = req.params.token;

  try {
    // Find the user with the provided verification token
    const user = await userModel.findOne({ token: token });

    if (!user) {
      return res.status(400).json({ Error: "Invalid token" });
    }

    req.user = user;
    user.isEmailVerified = true;
    await user.save();

    return res.json({ message: "Email verified successfully" });
  } catch (error) {
    return res.json({ Error: "Error occurred during verification", error });
  }
};

const user_logout = (req, res) => {
  res.clearCookie("token");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.redirect("/users/signin");
};

const verifyemail = (req, res) => {
  res.render("verifyEmail");
};

const forgotpass_get = (req, res) => {
  console.log("This is forgotpass get");
  res.render("forgot-password");
};

const forgotpass_post = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;

    await user.save();

    const resetLink = `${process.env.BASE_URL}users/reset/reset-password/${resetToken}`;

    await sendEmail(
      email,
      "Password Reset Request",
      `
        <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      `
    );

    res.send(
      "An email has been sent to your address with further instructions."
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const resetpass_get = async (req, res) => {
  const token = req.params.token;

  try {
    const user = await userModel.findOne({
      resetPasswordToken: token,
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token");
    }

    res.render("newpass", { token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const resetpass_post = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await userModel.findOne({
      resetPasswordToken: token,
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;

    await user.save();

    res.send("Password reset successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  signin_get,
  signin_post,
  signup_get,
  signup_post,
  user_logout,
  verifyemail,
  verifyEmail_get,
  forgotpass_get,
  forgotpass_post,
  resetpass_post,
  resetpass_get,
};
