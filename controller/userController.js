const User = require("../modals/user");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const { LoginValidation, SignUpValidation, Auth } = require("../middleware/middleware")
require("dotenv").config();

async function signup(req, res) {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).send("User already exists!");
    }
    const salt = await bcrypt.genSalt(10);
    console.log('salt === ', salt);


    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
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
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "mykey",
      { expiresIn: "1h" }
    );


    // 4. Return token to client
    res.json({
      message: "Login successful",
      token: `Bearer ${token}`,
      id: user._id,
    });

  } catch (error) {
    res.status(500).json({
      message: "Login error",
      error: error.message,
    });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 1000 * 60 * 5;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Your OTP for Password Reset",
      html: `<p>Your OTP for password reset is <b>${otp}</b>.</p>
             <p>This OTP will expire in 5 minutes.</p>`,
    });

    res.status(200).send({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Forgot password OTP error:", error);
    res.status(500).send({ message: "Internal server error" });
  }
}


async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({
      email,
      otp,
      otpExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send({ message: "Invalid or expired OTP" });
    }

    res.status(200).send({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).send({ message: "Internal server error" });
  }
}

async function resetPassword(req, res) {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
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
  verifyOtp,
  resetPassword,
};
