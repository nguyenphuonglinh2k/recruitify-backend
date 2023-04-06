const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");

router.get("/users", userController.getUsers);

module.exports = router;
