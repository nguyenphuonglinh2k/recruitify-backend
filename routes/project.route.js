const express = require("express");
const router = express.Router();

const projectController = require("../controllers/project.controller");

router.get("/projects/:userId", projectController.getProjects);

router.get("/project/:projectId/:userId", projectController.getProjectInfo);

router.post("/project", projectController.postProject);

router.put("/project/:projectId", projectController.putProjectInfo);

module.exports = router;
