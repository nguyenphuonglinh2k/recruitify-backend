const express = require("express");
const router = express.Router();

const applicationController = require("../controllers/application.controller");

router.get("/applications", applicationController.getApplications);

router.get(
  "/application/:applicationId",
  applicationController.getApplicationDetail,
);

router.post("/application", applicationController.postApplication);

router.put("/application/:applicationId", applicationController.putApplication);

router.delete(
  "/application/:applicationId",
  applicationController.deleteApplication,
);

module.exports = router;
