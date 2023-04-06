const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");

router.get("/users", userController.getUsers);

router.get("/user/:userId", userController.getUserInfo);

router.put("/profile/:userId", userController.putUpdateProfile);

module.exports = router;
