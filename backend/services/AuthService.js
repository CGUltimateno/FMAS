const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");


class AuthService {
  static async registerUser({ firstName, lastName, username, email, password }) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) throw new Error("Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);

    return await User.create({ firstName, lastName, username, email, password: hashedPassword });

   
  }

  static async loginUser({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { userId: user.userId, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7h" }  
    );

    return { token, user: { userId: user.userId, firstName: user.firstName, lastName: user.lastName, email: user.email } };
  }

  static async verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}



module.exports = AuthService;
