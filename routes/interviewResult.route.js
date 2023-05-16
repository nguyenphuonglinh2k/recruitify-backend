const express = require("express");
const router = express.Router();

const interviewResultController = require("../controllers/interviewResult.controller");

router.get("/interview-results", interviewResultController.getInterviewResults);

router.get(
  "/interview-result/:resultId",
  interviewResultController.getInterviewResultDetail,
);

router.get(
  "/interview-result/application/:applicationId",
  interviewResultController.getInterviewResultDetailOfApplicationId,
);

router.put(
  "/interview-result/:resultId",
  interviewResultController.putInterviewResult,
);

router.post("/interview-result", interviewResultController.postInterviewResult);

module.exports = router;
