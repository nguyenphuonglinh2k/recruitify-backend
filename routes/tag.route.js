const express = require("express");
const router = express.Router();

const tagController = require("../controllers/tag.controller");

router.get("/tags", tagController.getTags);

router.post("/tags", tagController.postTags);

router.put("/tags", tagController.putTags);

module.exports = router;
