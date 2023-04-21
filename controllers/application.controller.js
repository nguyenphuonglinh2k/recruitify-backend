const Application = require("../models/application.model");
const Job = require("../models/job.model");
const Constant = require("../utils/constant");

module.exports.getApplications = async (req, res) => {
  const status =
    req.query?.status ?? Constant.APPLICATION_PROCESS_STATUS.screening;

  try {
    const applications = await Application.find({ status }).populate([
      { path: "skillIds" },
      { path: "jobId" },
    ]);
    res.json(applications);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.getApplicationDetail = async (req, res) => {
  const applicationId = req.params.applicationId;

  try {
    const application = await Application.findById(applicationId).populate([
      { path: "skillIds" },
      { path: "jobId" },
    ]);
    res.json(application);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.postApplication = async (req, res) => {
  const { applicantInfo, jobId, status, attachments, skillIds, isPriority } =
    req.body;

  if (!applicantInfo?.name || !applicantInfo?.email || !attachments || !jobId) {
    return res
      .status(400)
      .json({ message: "applicantInfo, jobId and attachments is required" });
  }

  try {
    const newApplication = {
      applicantInfo: {
        name: applicantInfo.name,
        email: applicantInfo.email,
        phoneNumber: applicantInfo?.phoneNumber ?? null,
        address: applicantInfo?.address || null,
        avatarUrl: applicantInfo?.avatarUrl || Constant.DEFAULT_AVATAR_URL,
      },
      jobId,
      attachments,
      status: status ?? Constant.APPLICATION_PROCESS_STATUS.screening,
      skillIds: skillIds ?? [],
      isPriority: isPriority ?? false,
    };

    const updateJobPromise = Job.findByIdAndUpdate(
      { _id: jobId },
      { $inc: { applicationTotal: 1 } },
    );

    const applicationPromise = Application.create(newApplication);

    Promise.all([updateJobPromise, applicationPromise])
      .then(response => {
        return res.json({ message: "Create successfully", data: response[1] });
      })
      .catch(err => {
        return res.status(400).json(err);
      });
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.putApplication = async (req, res) => {
  const applicationId = req.params.applicationId;
  const { applicantInfo, jobId, status, skillIds, isPriority, attachments } =
    req.body;

  const newInfo = { jobId, status, skillIds, isPriority, attachments };

  try {
    const prevApplication = await Application.findById(applicationId);
    const promises = [];

    if (jobId) {
      const isDifferentJobId = prevApplication.jobId.valueOf() !== jobId;

      if (isDifferentJobId) {
        const updateNewJobPromise = Job.findByIdAndUpdate(
          { _id: jobId },
          { $inc: { applicationTotal: 1 } },
        );
        const updatePrevJobPromise = Job.findByIdAndUpdate(
          { _id: prevApplication.jobId },
          { $inc: { applicationTotal: -1 } },
        );

        promises.push([updateNewJobPromise, updatePrevJobPromise]);
      }
    }

    const prevApplicantInfo = prevApplication.applicantInfo;

    if (applicantInfo) {
      newInfo.applicantInfo = {
        name: applicantInfo?.name ?? prevApplicantInfo.name,
        email: applicantInfo?.email ?? prevApplicantInfo.email,
        phoneNumber:
          applicantInfo?.phoneNumber ?? prevApplicantInfo.phoneNumber,
        address: applicantInfo?.address ?? prevApplicantInfo.address,
        avatarUrl: applicantInfo?.avatarUrl ?? prevApplicantInfo.avatarUrl,
      };
    }

    const updateApplicationPromise = Application.findByIdAndUpdate(
      { _id: applicationId },
      newInfo,
      {
        new: true,
      },
    );

    Promise.all([updateApplicationPromise, ...promises])
      .then(response => {
        return res.json({ message: "Update successfully", data: response[0] });
      })
      .catch(err => {
        return res.status(400).json(err);
      });
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.deleteApplication = async (req, res) => {
  const applicationId = req.params.applicationId;

  try {
    await Application.findOneAndDelete({ _id: applicationId }).then(result => {
      if (!result) {
        res.status(400).json({
          message: "Delete application failed",
        });
      } else {
        res.json({
          message: "Delete application successfully",
        });
      }
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};
