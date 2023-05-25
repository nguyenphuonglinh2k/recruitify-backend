const Job = require("../models/job.model");
const User = require("../models/user.model");
const Application = require("../models/application.model");
const Constant = require("../utils/constant");

module.exports.getJobs = async (req, res) => {
  const status = req.query?.status;
  const options = {};

  if (status) {
    options.status = status;
  }

  try {
    const jobs = await Job.find(options).populate([
      { path: "creatorId", select: "-password" },
      { path: "assigneeIds", select: "-password" },
      { path: "tagIds" },
    ]);
    res.json(jobs);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.getJobDetail = async (req, res) => {
  const jobId = req.params.jobId;

  try {
    const job = await Job.findById(jobId).populate([
      { path: "creatorId", select: "-password" },
      { path: "assigneeIds", select: "-password" },
      { path: "tagIds" },
    ]);
    res.json(job);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.getApplicationsOfJob = async (req, res) => {
  const jobId = req.params.jobId;

  try {
    const applications = await Application.find({ jobId }).sort({ status: 1 });

    res.json(applications);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.postJob = async (req, res) => {
  const {
    name,
    creatorId,
    startDate,
    endDate,
    locations,
    tagIds,
    isPriority,
    assigneeIds,
  } = req.body;

  if (!name || !creatorId) {
    return res.status(400).json({ message: "Name and creatorId is required" });
  }

  try {
    const creator = await User.findById(creatorId);

    if (!creator) {
      return res.status(400).json({ message: "Creator is not exist" });
    }

    const newProject = {
      name,
      creatorId,
      status: Constant.JOB_AND_APPLICATION_STATUS.active,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      locations: locations ?? [],
      tagIds: tagIds ?? [],
      isPriority: isPriority ?? false,
      assigneeIds: assigneeIds ?? [],
      applicationTotal: 0,
    };

    await Job.create(newProject).then((result, err) => {
      if (err) {
        return res.status(400).json({ message: "Create job failed" });
      }

      res
        .status(201)
        .json({ message: "Create job successfully", data: result });
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.putJob = async (req, res) => {
  const jobId = req.params.jobId;
  const {
    name,
    startDate,
    endDate,
    locations,
    tagIds,
    isPriority,
    status,
    assigneeIds,
  } = req.body;

  try {
    Job.findByIdAndUpdate(
      { _id: jobId },
      {
        name,
        startDate,
        endDate,
        locations,
        tagIds,
        isPriority,
        status,
        assigneeIds,
      },
      { new: true },
    )
      .then(result => {
        if (!result) {
          return res.status(400).json({ message: "Update job failed" });
        }

        res.json({ message: "Update job successfully", data: result });
      })
      .catch(error => res.status(400).json(error));
  } catch (error) {
    res.status(400).json(error);
  }
};

// Delete job -> delete all application inside
module.exports.deleteJob = async (req, res) => {
  const jobId = req.params.jobId;

  try {
    const deleteJobPromise = Job.findOneAndDelete({ _id: jobId });
    const deleteApplications = Application.deleteMany({ jobId });

    await Promise.all([deleteJobPromise, deleteApplications])
      .then(() => res.json({ message: "Delete successfully" }))
      .catch(err => {
        return res.status(400).json(err);
      });
  } catch (error) {
    return res.status(400).json(error);
  }
};
