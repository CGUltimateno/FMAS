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

    return { token, user: { userId: user.userId, firstName: user.firstName, lastName: user.lastName, email: user.email, username: user.username } };
  }

  static async verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

    static async FollowTeam(userId, teamId, teamData) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        const favoriteTeams = user.favoriteTeams || [];
        if (!favoriteTeams.includes(teamId)) {
        favoriteTeams.push(teamId);
        user.favoriteTeams = favoriteTeams;
        await user.save();
        }

        return user;
    }

    static async UnfollowTeam(userId, teamId) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        const favoriteTeams = user.favoriteTeams || [];
        const teamIndex = favoriteTeams.indexOf(teamId);
        if (teamIndex !== -1) {
            favoriteTeams.splice(teamIndex, 1);
            user.favoriteTeams = favoriteTeams;
            await user.save();
        }

        return user;
    }
}



module.exports = AuthService;
