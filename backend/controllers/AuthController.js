const AuthService = require("../services/AuthService");
const path = require("path");

class AuthController {
  static async register(req, res) {
    try {
      let profilePicturePath = null;
      if (req.file) {
        profilePicturePath = `/profile_pics/${path.basename(req.file.path)}`;
      }
      const result = await AuthService.registerUser(req.body, profilePicturePath);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { token, user } = await AuthService.loginUser(req.body);
      res.json({ message: "Login successful", token, user });
    } catch (error) {
      if (error.message === "EMAIL_NOT_VERIFIED") {
        return res.status(403).json({ error: "Email not verified. Please check your inbox or request a new verification email.", errorCode: "EMAIL_NOT_VERIFIED" });
      }
      res.status(401).json({ error: error.message });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { userId } = req.user;
      const { firstName, lastName, username } = req.body;

      let profilePicturePath = null;
      if (req.file) {
        console.log('File uploaded successfully:', req.file);
        profilePicturePath = `/profile_pics/${req.file.filename}`;
      } else {
        console.log('No file uploaded or upload failed');
      }

      const updatedUser = await AuthService.updateUserProfile(
        userId,
        { firstName, lastName, username },
        profilePicturePath
      );

      res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: error.message });
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);

      res.json({ message: "If an account with that email exists, a password reset link has been sent." });
    } catch (error) {
      console.error("Password reset request error:", error);
      res.json({ message: "If an account with that email exists, a password reset link has been sent." });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      const result = await AuthService.resetPassword(token, password);
      res.json({ message: result.message });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getUserProfile(req, res) {
    try {
      const { userId } = req.user; // Assuming AuthMiddleware adds user to req
      const userProfile = await AuthService.getFullUserProfile(userId);
      res.json(userProfile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(404).json({ error: error.message });
    }
  }

  static async FollowTeam(req, res) {
    try {
      const { userId } = req.user;
      const { teamId, teamData } = req.body;

      const userData = await AuthService.FollowTeam(userId, teamId, teamData);

      res.json(userData); // Changed: directly return the array of favorite teams
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async UnfollowTeam(req, res) {
    try {
      const { userId } = req.user;
      const { teamId } = req.body;

      const favoriteTeams = await AuthService.UnfollowTeam(userId, teamId);

      res.json(favoriteTeams); // Changed: directly return the array of favorite teams
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      const result = await AuthService.verifyUserEmail(token);
      res.json({ message: result.message });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async resendVerificationEmail(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required." });
      }
      const result = await AuthService.resendVerificationEmail(email);
      res.json({ message: result.message });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = AuthController;
