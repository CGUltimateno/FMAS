const express = require("express");
const AuthController = require("../controllers/AuthController");
const AuthMiddleware = require("../middleware/AuthMiddleware");

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

router.get("/profile", AuthMiddleware.authenticate, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

router.post("/follow-team", AuthMiddleware.authenticate, AuthController.FollowTeam);

router.post("/unfollow-team", AuthMiddleware.authenticate, AuthController.UnfollowTeam);

module.exports = router;
