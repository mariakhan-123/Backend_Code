// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   username: {type: String,},
//   email: {type: String,},
//   password: {type: String,} 
// });

// const User = mongoose.model('User', userSchema);
// module.exports = User;
// models/user.js (or modals/user.js as per your typo)
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  resetToken: String,
  resetTokenExpiry: Date,
});

module.exports = mongoose.model("User", userSchema);
