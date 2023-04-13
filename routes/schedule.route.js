const express = require("express");
const router = express.Router();

const scheduleController = require("../controllers/schedule.controller");

router.get("/schedules", scheduleController.getSchedules);

router.get("/schedule/:scheduleId", scheduleController.getScheduleDetail);

router.post("/schedule", scheduleController.postSchedules);

router.put("/schedule/:scheduleId", scheduleController.putSchedule);

router.delete("/schedule/:scheduleId", scheduleController.deleteSchedule);

module.exports = router;
