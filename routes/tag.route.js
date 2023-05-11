const express = require("express");
const router = express.Router();

const tagController = require("../controllers/tag.controller");

router.get("/tags", tagController.getTags);

router.post("/tags", tagController.postTags);

router.put("/tag/:tagId", tagController.putTags);

router.delete("/tag/:tagId", tagController.deleteTag);

module.exports = router;
