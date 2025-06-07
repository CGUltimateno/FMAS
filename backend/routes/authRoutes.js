const express = require("express");
const AuthController = require("../controllers/AuthController");
const AuthMiddleware = require("../middleware/AuthMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Updated register route to handle profile picture upload
router.post("/register", upload.single('profilePicture'), AuthController.register);
router.post("/login", AuthController.login);

// Password reset routes
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password/:token", AuthController.resetPassword);

// Email verification route
router.get("/verify-email/:token", AuthController.verifyEmail);

// Resend verification email route
router.post("/resend-verification-email", AuthController.resendVerificationEmail);

// Route for updating profile, uses authentication and file upload middleware
router.put("/profile", AuthMiddleware.authenticate, upload.single('profilePicture'), AuthController.updateProfile);

// This is the route that was previously /profile, now changed to /me
router.get("/me", AuthMiddleware.authenticate, AuthController.getUserProfile); // Changed from /profile to /me

router.post("/follow-team", AuthMiddleware.authenticate, AuthController.FollowTeam);

router.post("/unfollow-team", AuthMiddleware.authenticate, AuthController.UnfollowTeam);

module.exports = router;
