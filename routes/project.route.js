const express = require("express");
const router = express.Router();

const projectController = require("../controllers/project.controller");

router.get("/projects/:userId", projectController.getProjects);

router.get("/project/:projectId", projectController.getProjectInfo);

router.get(
  "/project/:projectId/members",
  projectController.getMembersOfProject,
);

router.post("/project", projectController.postProject);

router.put("/project/:projectId", projectController.putProjectInfo);

router.put(
  "/project/:projectId/tasks",
  projectController.addExistTaskToProject,
);

router.delete("/project/:projectId", projectController.deleteProject);

module.exports = router;
