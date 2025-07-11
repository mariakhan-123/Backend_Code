const jwt = require("jsonwebtoken");
function LoginValidation(req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  if (
    !email ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (
    !password ||
    typeof password !== "string" ||
    password.length < 5 ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return res.status(400).json({
      error:
        "Password must be at least 5 characters, include a number and an uppercase letter",
    });
  }
  next();
}

function SignUpValidation(req, res, next) {
  const username = req.body.username;
  const email= req.body.email
  const password = req.body.password;
  if (!username || typeof username !== "string" || username.length < 5) {
    return res.status(400).json({ error: "Invalid username" });
  }
   if (
    !email ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (
    !password ||
    typeof password !== "string" ||
    password.length < 5 ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return res.status(400).json({
      error:
        "Password must be at least 5 characters, include a number and an uppercase letter",
    });
  }
  next();
}

function Auth(req, res, next) {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Token is missing" });
  }

  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1]; // Only keep the token part
  }

  jwt.verify(token, process.env.JWT_SECRET || "mykey", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
}

module.exports = {
  LoginValidation,
  SignUpValidation,
  Auth,
};
