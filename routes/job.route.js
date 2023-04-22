const express = require("express");
const router = express.Router();

const jobController = require("../controllers/job.controller");

router.get("/jobs", jobController.getJobs);

router.get("/job/:jobId", jobController.getJobDetail);

router.get("/job/:jobId/applications", jobController.getApplicationsOfJob);

router.post("/job", jobController.postJob);

router.put("/job/:jobId", jobController.putJob);

router.delete("/job/:jobId", jobController.deleteJob);

module.exports = router;
