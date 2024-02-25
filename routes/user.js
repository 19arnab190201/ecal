const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  forgotPassword,
  getLoggedInUserDetails,
  changePassword,
  updateUserDetails,
} = require("../controllers/userControllers");

const { isLoggedIn } = require("../middlewares/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgot-password").post(forgotPassword);
router.route("/user/:id").get(getLoggedInUserDetails);
router.route("/password/update").post(changePassword);
router.route("/user/update").post(updateUserDetails);

module.exports = router;
