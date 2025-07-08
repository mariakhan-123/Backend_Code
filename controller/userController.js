const User = require("../modals/user");
const crypto = require("crypto");       
const nodemailer = require("nodemailer");
require('dotenv').config();
async function signup(req, res) {
  const { username, email, password } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username: username });

    if (existingUser) {
      return res.status(400).send("User already exists!");
    }

    // Create new user in MongoDB
    const newUser = await User.create({
      username,
      email,
      password,
    });

    res.status(201).send("User registered successfully");
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).send("Internal server error");
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({
      message: "Login error",
      error: error.message, // this gives a readable string in frontend
    });
  }
}

// async function forgotPassword(req, res) {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).send("User not found");
//     }

//     // Generate token
//     const token = crypto.randomBytes(32).toString("hex");

//     // Set token and expiry in DB
//     user.resetToken = token;
//     user.resetTokenExpiry = Date.now() + 1000 * 60 * 15; // 15 minutes
//     await user.save();

//     // Email config (example using Gmail)
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL, // your email in .env
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const resetLink = `http://localhost:3000/reset-password?token=${token}`;

//     await transporter.sendMail({
//       to: user.email,
//       subject: "Reset your password",
//       html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link valid for 15 minutes.</p>`,
//     });

//     res.send("Password reset link sent to your email.");
//   } catch (error) {
//     console.error("Forgot password error:", error);
//     res.status(500).send("Internal server error");
//   }
// }
async function forgotPassword(req, res) {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    // Save token and expiry to user
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 15; // 15 min
    await user.save();
    // Create transporter (Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,       // Your Gmail from .env
        pass: process.env.EMAIL_PASS,  // App password
      },
    });
    // Link for frontend reset page
    const resetLink = `http://localhost:8000/reset-password/${token}`;
    // Send email
    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset.</p>
             <p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 15 minutes.</p>`,
    });
    res.status(200).send({ message: "Reset link sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).send({ message: "Internal server error" });
  }
}
async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // Token not expired
    });

    if (!user) {
      return res.status(400).send("Invalid or expired token");
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();
    res.send("Password updated successfully");
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).send("Internal server error");
  }
}

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword
};
