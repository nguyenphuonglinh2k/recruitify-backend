const Application = require("../models/application.model");
const Constant = require("../utils/constant");

module.exports.getApplications = async (req, res) => {
  const status =
    req.body?.status ?? Constant.APPLICATION_PROCESS_STATUS.screening;

  try {
    const applications = await Application.find({ status });
    res.json(applications);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.getApplicationDetail = async (req, res) => {
  const applicationId = req.params.applicationId;

  try {
    const application = await Application.findById(applicationId);
    res.json(application);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.postApplication = async (req, res) => {
  const {
    startDate,
    endDate,
    applicantInfo,
    jobId,
    status,
    attachments,
    skillIds,
    isPriority,
  } = req.body;

  if (!applicantInfo?.name || !applicantInfo?.email || attachments || jobId) {
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
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      status: status ?? Constant.APPLICATION_PROCESS_STATUS.screening,
      skillIds: skillIds ?? [],
      isPriority: isPriority ?? false,
    };

    await Application.create(newApplication).then((result, err) => {
      if (err) {
        return res.status(400).json({ message: "Create  failed" });
      }

      res.status(201).json({ message: "Create  successfully", data: result });
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.putApplication = async (req, res) => {
  const applicationId = req.params.applicationId;
  const {
    startDate,
    endDate,
    applicantInfo,
    jobId,
    status,
    skillIds,
    isPriority,
    attachments,
  } = req.body;

  try {
    await Application.findByIdAndUpdate(
      { _id: applicationId },
      {
        applicantInfo: {
          name: applicantInfo?.name,
          email: applicantInfo?.email,
          phoneNumber: applicantInfo?.phoneNumber,
          address: applicantInfo?.address,
          avatarUrl: applicantInfo?.avatarUrl,
        },
        jobId,
        status,
        skillIds,
        isPriority,
        startDate,
        endDate,
        attachments,
      },
      { new: true },
    )
      .then(result => {
        if (!result) return res.status(400).json({ message: "Update failed" });

        res.json({ message: "Update successfully", data: result });
      })
      .catch(error => res.status(400).json(error));
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
