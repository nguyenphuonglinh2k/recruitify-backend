const express = require("express");
const router = express.Router();

const taskController = require("../controllers/task.controller");

router.get("/project/:projectId/tasks", taskController.getProjectTasks);

router.get("/member/:memberId/tasks", taskController.getTasksOfMember);

router.get("/task/:taskId/:memberId", taskController.getTaskDetailOfMember);

router.get(
  "/project/:projectId/member-tasks",
  taskController.getTasksOfAllMemberNotInProject,
);

router.post("/task", taskController.postTask);

router.put("/task/:taskId", taskController.putTask);

router.delete("/task/:taskId", taskController.deleteTask);

module.exports = router;
