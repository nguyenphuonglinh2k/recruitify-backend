const express = require("express");
const router = express.Router();

const trainResultController = require("../controllers/trainResult.controller");

router.get(
  "/train-results/not-evaluated-users",
  trainResultController.getNotEvaluatedUsers,
);

router.get("/train-results", trainResultController.getTrainResults);

router.get(
  "/train-result/:resultId",
  trainResultController.getTrainResultDetail,
);

router.put("/train-result/:resultId", trainResultController.putTrainResult);

router.post("/train-result", trainResultController.postTrainResult);

module.exports = router;
