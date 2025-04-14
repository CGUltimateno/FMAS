const AuthService = require("../services/AuthService");

class AuthController {
  static async register(req, res) {
    try {
      const user = await AuthService.registerUser(req.body);
      res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { token, user } = await AuthService.loginUser(req.body);
      res.json({ message: "Login successful", token, user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async FollowTeam(req, res) {
    try {
      const { teamId, teamData } = req.body;
      const user = await AuthService.FollowTeam(req.user.userId, teamId, teamData);
      res.json({ message: "Team followed successfully", user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async UnfollowTeam(req, res) {
    try {
      const { teamId } = req.body;
      const user = await AuthService.UnfollowTeam(req.user.userId, teamId);
      res.json({ message: "Team unfollowed successfully", user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AuthController;
