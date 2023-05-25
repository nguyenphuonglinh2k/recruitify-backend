const Tag = require("../models/tag.model");
const Schedule = require("../models/schedule.model");

// 1. Get by member
// 2. Get by date
module.exports.getSchedules = async (req, res) => {
  try {
    const { date, memberId } = req.query;
    const filterOptions = {};

    if (date) {
      filterOptions.date = date;
    }
    if (memberId) {
      filterOptions.assigneeIds = { $all: [memberId] };
    }

    const schedules = await Schedule.find(filterOptions).populate([
      { path: "assigneeIds", select: "-password" },
      { path: "creatorId", select: "-password" },
      { path: "applicationId" },
      { path: "jobId" },
    ]);
    res.json(schedules);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.getScheduleOfApplicant = async (req, res) => {
  const applicationId = req.params.applicationId;

  try {
    const schedule = await Schedule.findOne({ applicationId }).populate([
      { path: "assigneeIds", select: "-password" },
      { path: "creatorId", select: "-password" },
      { path: "applicationId" },
      { path: "jobId" },
    ]);
    res.json(schedule);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.getScheduleDetail = async (req, res) => {
  const scheduleId = req.params.scheduleId;

  try {
    const schedule = await Schedule.findById(scheduleId).populate([
      { path: "assigneeIds", select: "-password" },
      { path: "creatorId", select: "-password" },
      { path: "applicationId" },
      { path: "jobId" },
    ]);
    res.json(schedule);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.postSchedules = async (req, res) => {
  const {
    description,
    name,
    date,
    startTime,
    endTime,
    creatorId,
    applicationId,
    jobId,
    assigneeIds,
  } = req.body;

  try {
    if (
      !name ||
      !date ||
      !endTime ||
      !startTime ||
      !creatorId ||
      !assigneeIds
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newSchedule = {
      name,
      description,
      date,
      startTime,
      endTime,
      creatorId,
      applicationId,
      jobId,
      assigneeIds,
    };

    await Schedule.create(newSchedule).then((result, err) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "Create schedule is failed", error: err });
      }

      return res
        .status(201)
        .json({ message: "Create schedule successfully", data: result });
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.putSchedule = async (req, res) => {
  const {
    description,
    name,
    date,
    startTime,
    endTime,
    jobId,
    assigneeIds,
    applicationId,
  } = req.body;
  const { scheduleId } = req.params;

  if (!name || !date || !endTime || !startTime || !assigneeIds) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await Schedule.findByIdAndUpdate(
      { _id: scheduleId },
      {
        description,
        name,
        date,
        startTime,
        endTime,
        jobId,
        assigneeIds,
        applicationId,
      },
      { new: true },
    )
      .then(result => {
        if (!result) {
          return res.status(400).json({ message: "Schedule not found" });
        }

        res.json({ message: "Update schedule successfully", data: result });
      })
      .catch(err => res.status(400).json(err));
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.deleteSchedule = async (req, res) => {
  const scheduleId = req.params.scheduleId;

  try {
    await Schedule.findByIdAndDelete({ _id: scheduleId }).then(
      (result, error) => {
        if (error) {
          res.status(400).json({ message: "Delete failed", error });
        }

        res.json({ message: "Delete successfully" });
      },
    );
  } catch (error) {
    res.status(400).json(error);
  }
};
