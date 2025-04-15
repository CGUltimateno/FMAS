const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const UserTeam = require("../models/UserTeam");


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

        // Check if relationship already exists
        const existingFollow = await UserTeam.findOne({
            where: { userId, teamId }
        });

        if (!existingFollow) {
            await UserTeam.create({
                userId,
                teamId,
                teamName: teamData.name,
                teamCrest: teamData.crest
            });
        }

        // Get all followed teams to return updated user object
        const followedTeams = await UserTeam.findAll({
            where: { userId }
        });

        // Return user with formatted teams - this is the missing part
        user.favoriteTeams = followedTeams.map(team => ({
            id: team.teamId,
            name: team.teamName,
            crest: team.teamCrest
        }));

        return user;
    }

    static async UnfollowTeam(userId, teamId) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User not found");

        // Delete from UserTeam table
        await UserTeam.destroy({
            where: { userId, teamId }
        });

        // Get all followed teams to return updated user object
        const followedTeams = await UserTeam.findAll({
            where: { userId }
        });

        // Return user with formatted teams
        user.favoriteTeams = followedTeams.map(team => ({
            id: team.teamId,
            name: team.teamName,
            crest: team.teamCrest
        }));

        return user;
    }

}



module.exports = AuthService;
