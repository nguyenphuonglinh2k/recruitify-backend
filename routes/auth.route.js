const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

router.post("/login", authController.postSignIn);

router.post("/signup", authController.postSignUp);

router.put("/update-password/:userId", authController.putUpdatePassword);

module.exports = router;
