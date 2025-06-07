const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { Op } = require("sequelize");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const UserTeam = require("../models/UserTeam");
const EmailService = require("./EmailService");

const DEFAULT_PROFILE_PIC_URL = "/profile_pics/default_avatar.png";

class AuthService {
  // Helper function to get favorite teams
  static async getFavoriteTeams(userId) {
    const followedTeams = await UserTeam.findAll({
        where: { userId },
        attributes: [['teamId', 'id'], ['teamName', 'name'], ['teamCrest', 'crest']]
    });
    return followedTeams.map(team => team.toJSON());
  }

  static async registerUser({ firstName, lastName, username, email, password }, profilePictureUrl) {
    let existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        throw new Error("Email already registered and verified. Please login.");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const emailVerificationToken = crypto.randomBytes(32).toString("hex");
      const emailVerificationTokenExpires = new Date(Date.now() + 3600000); // 1 hour

      existingUser.firstName = firstName;
      existingUser.lastName = lastName;
      existingUser.username = username;
      existingUser.password = hashedPassword;
      existingUser.profilePictureUrl = profilePictureUrl || existingUser.profilePictureUrl || DEFAULT_PROFILE_PIC_URL;
      existingUser.emailVerificationToken = emailVerificationToken;
      existingUser.emailVerificationTokenExpires = emailVerificationTokenExpires;
      existingUser.isEmailVerified = false;

      await existingUser.save();

      try {
        await EmailService.sendVerificationEmail(existingUser.email, emailVerificationToken);
      } catch (emailError) {
        console.error("Failed to send verification email during re-registration attempt:", emailError);
      }
      return {
        message: "Account details updated. Please check your email to verify your account.",
      };
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const emailVerificationToken = crypto.randomBytes(32).toString("hex");
      const emailVerificationTokenExpires = new Date(Date.now() + 3600000); // 1 hour

      const newUser = await User.create({
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        profilePictureUrl: profilePictureUrl || DEFAULT_PROFILE_PIC_URL,
        emailVerificationToken,
        emailVerificationTokenExpires,
        isEmailVerified: false,
      });

      try {
        await EmailService.sendVerificationEmail(newUser.email, emailVerificationToken);
      } catch (emailError) {
        console.error("Failed to send verification email for new user:", emailError);
      }

      return {
        message: "Registration successful. Please check your email to verify your account.",
      };
    }
  }

  static async loginUser({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("Invalid credentials or user not found.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials or user not found.");
    }

    if (!user.isEmailVerified) {
      throw new Error("EMAIL_NOT_VERIFIED");
    }

    const token = jwt.sign(
      { userId: user.userId, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7h" }
    );

    const favoriteTeams = await AuthService.getFavoriteTeams(user.userId); // Fetch favorite teams

    return {
      token,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        profilePictureUrl: user.profilePictureUrl || DEFAULT_PROFILE_PIC_URL,
        isEmailVerified: user.isEmailVerified,
        isAdmin: user.isAdmin,
        favoriteTeams: favoriteTeams // Include favorite teams
      }
    };
  }

  static async verifyUserEmail(token) {
    const userToVerify = await User.findOne({
        where: {
            emailVerificationToken: token,
            emailVerificationTokenExpires: { [Op.gt]: new Date() }
        }
    });

    if (!userToVerify) {
        const expiredTokenUser = await User.findOne({ where: { emailVerificationToken: token } });
        if (expiredTokenUser) {
            throw new Error("Verification token has expired. Please request a new one.");
        }
        throw new Error("Invalid verification token.");
    }

    userToVerify.isEmailVerified = true;
    userToVerify.emailVerificationToken = null;
    userToVerify.emailVerificationTokenExpires = null;
    await userToVerify.save();

    return { message: "Email verified successfully. You can now log in." };
  }

  static async resendVerificationEmail(email) {
    const userToResend = await User.findOne({ where: { email } });
    if (!userToResend) {
        throw new Error("User with this email not found.");
    }
    if (userToResend.isEmailVerified) {
        throw new Error("Email is already verified.");
    }

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    userToResend.emailVerificationToken = emailVerificationToken;
    userToResend.emailVerificationTokenExpires = emailVerificationTokenExpires;
    await userToResend.save();

    try {
        await EmailService.sendVerificationEmail(userToResend.email, emailVerificationToken);
        return { message: "Verification email resent successfully. Please check your inbox." };
    } catch (emailError) {
        console.error("Failed to resend verification email:", emailError);
        throw new Error("Failed to resend verification email. Please try again later.");
    }
  }

  static async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    const passwordResetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    user.passwordResetToken = passwordResetToken;
    user.passwordResetTokenExpires = passwordResetTokenExpires;
    await user.save();

    try {
      await EmailService.sendPasswordResetEmail(user.email, passwordResetToken);
      return { message: "Password reset email sent successfully. Please check your inbox." };
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      throw new Error("Failed to send password reset email");
    }
  }

  static async resetPassword(token, newPassword) {
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
        passwordResetTokenExpires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      throw new Error("Invalid or expired password reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;
    await user.save();

    return { message: "Password has been reset successfully" };
  }

  static async verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  static async updateUserProfile(userId, { firstName, lastName, username }, profilePicturePath) {
    const userToUpdate = await User.findByPk(userId);
    if (!userToUpdate) throw new Error("User not found");

    if (!userToUpdate.isEmailVerified) {
        throw new Error("Please verify your email before updating your profile.");
    }

    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (username) {
        const existingUserWithUsername = await User.findOne({ where: { username, userId: { [Op.ne]: userId } } });
        if (existingUserWithUsername) {
            throw new Error("Username already taken");
        }
        updates.username = username;
    }
    if (profilePicturePath) updates.profilePictureUrl = profilePicturePath;

    await userToUpdate.update(updates);

    const favoriteTeams = await AuthService.getFavoriteTeams(userToUpdate.userId); // Also include fav teams on profile update response

    return {
        userId: userToUpdate.userId,
        firstName: userToUpdate.firstName,
        lastName: userToUpdate.lastName,
        email: userToUpdate.email,
        username: userToUpdate.username,
        profilePictureUrl: userToUpdate.profilePictureUrl,
        isEmailVerified: userToUpdate.isEmailVerified,
        isAdmin: userToUpdate.isAdmin,
        favoriteTeams: favoriteTeams // Include favorite teams
    };
  }

  // New method for the /profile endpoint
  static async getFullUserProfile(userId) {
    const user = await User.findByPk(userId, {
        attributes: ['userId', 'firstName', 'lastName', 'email', 'username', 'profilePictureUrl', 'isEmailVerified', 'isAdmin']
    });
    if (!user) {
        throw new Error("User not found");
    }

    const favoriteTeams = await AuthService.getFavoriteTeams(user.userId);

    return {
        ...user.toJSON(),
        favoriteTeams: favoriteTeams
    };
  }

  static async FollowTeam(userId, teamId, teamData) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");
    if (!user.isEmailVerified) throw new Error("Please verify your email to use this feature.");

    const existingFollow = await UserTeam.findOne({ where: { userId, teamId } });
    if (!existingFollow) {
        await UserTeam.create({ userId, teamId, teamName: teamData.name, teamCrest: teamData.crest });
    }
    const followedTeams = await UserTeam.findAll({ where: { userId } });
    return followedTeams.map(team => ({ id: team.teamId, name: team.teamName, crest: team.teamCrest }));
  }

  static async UnfollowTeam(userId, teamId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");
    if (!user.isEmailVerified) throw new Error("Please verify your email to use this feature.");

    await UserTeam.destroy({ where: { userId, teamId } });
    const followedTeams = await UserTeam.findAll({ where: { userId } });
    return followedTeams.map(team => ({ id: team.teamId, name: team.teamName, crest: team.teamCrest }));
  }
}

module.exports = AuthService;

