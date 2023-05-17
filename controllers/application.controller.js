const Application = require("../models/application.model");
const Job = require("../models/job.model");
const Constant = require("../utils/constant");

const moment = require("moment");

module.exports.getApplicationStatistics = async (_, res) => {
  try {
    const applications = await Application.find().lean();

    const screenApplications = applications.filter(
      item => item.status === Constant.APPLICATION_PROCESS_STATUS.screening,
    );
    const interviewApplications = applications.filter(
      item => item.status === Constant.APPLICATION_PROCESS_STATUS.interview,
    );
    const hireApplications = applications.filter(
      item => item.status === Constant.APPLICATION_PROCESS_STATUS.hire,
    );
    const rejectApplications = applications.filter(
      item => item.status === Constant.APPLICATION_PROCESS_STATUS.reject,
    );

    res.json({
      screening: screenApplications.length,
      interview: interviewApplications.length,
      hire: hireApplications.length,
      reject: rejectApplications.length,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.getActivityStatistics = async (_, res) => {
  const startOfToday = new Date(
    moment().startOf("day").format(Constant.FORMAT_DATE_WITH_HYPHEN),
  );
  const endOfToday = new Date(
    moment().endOf("day").format(Constant.FORMAT_DATE_WITH_HYPHEN),
  );

  // Yesterday
  const startOfYesterday = new Date(
    moment()
      .subtract(1, "days")
      .startOf("day")
      .format(Constant.FORMAT_DATE_WITH_HYPHEN),
  );
  const endOfYesterday = new Date(
    moment()
      .subtract(1, "days")
      .endOf("day")
      .format(Constant.FORMAT_DATE_WITH_HYPHEN),
  );

  // This week
  const currentStartOfMonday = new Date(
    moment()
      .startOf("isoWeek")
      .add(0, "days")
      .format(Constant.FORMAT_DATE_WITH_HYPHEN),
  );
  const currentStartOfSaturday = new Date(
    moment()
      .startOf("isoWeek")
      .add(5, "days")
      .format(Constant.FORMAT_DATE_WITH_HYPHEN),
  );

  // Last week
  const lastStartOfMonday = new Date(
    moment()
      .subtract(1, "weeks")
      .startOf("isoWeek")
      .format(Constant.FORMAT_DATE_WITH_HYPHEN),
  );
  const lastStartOfSaturday = new Date(
    moment()
      .subtract(1, "weeks")
      .startOf("isoWeek")
      .add(5, "days")
      .format(Constant.FORMAT_DATE_WITH_HYPHEN),
  );

  // This month
  const startOfThisMonth = new Date(
    moment().startOf("month").format(Constant.FORMAT_DATE_WITH_HYPHEN),
  );
  const endOfThisMonth = new Date(
    moment().endOf("month").format(Constant.FORMAT_DATE_WITH_HYPHEN),
  );

  // Last month
  const startOfLastMonth = new Date(
    moment()
      .subtract(1, "months")
      .startOf("month")
      .format(Constant.FORMAT_DATE_WITH_HYPHEN),
  );
  const endOfLastMonth = new Date(
    moment()
      .subtract(1, "months")
      .endOf("month")
      .format(Constant.FORMAT_DATE_WITH_HYPHEN),
  );

  try {
    const todayApplicationsPromise = Application.find({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });
    const yesterdayApplicationsPromise = Application.find({
      createdAt: { $gte: startOfYesterday, $lte: endOfYesterday },
    });
    const thisMonthApplicationsPromise = Application.find({
      createdAt: { $gte: startOfThisMonth, $lte: endOfThisMonth },
    });
    const lastMonthApplicationsPromise = Application.find({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });
    const thisWeekApplicationsPromise = Application.find({
      createdAt: { $gte: currentStartOfMonday, $lte: currentStartOfSaturday },
    });
    const lastWeekApplicationsPromise = Application.find({
      createdAt: { $gte: lastStartOfMonday, $lte: lastStartOfSaturday },
    });

    await Promise.all([
      todayApplicationsPromise,
      yesterdayApplicationsPromise,
      thisMonthApplicationsPromise,
      thisWeekApplicationsPromise,
      lastMonthApplicationsPromise,
      lastWeekApplicationsPromise,
    ]).then(responses =>
      res.json({
        today: responses[0].length,
        yesterday: responses[1].length,
        thisMonth: responses[2].length,
        thisWeek: responses[3].length,
        lastMonth: responses[4].length,
        lastWeek: responses[5].length,
      }),
    );
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.getApplications = async (req, res) => {
  const status = req.query?.status;
  const options = {};

  if (status) {
    options.status = status;
  }

  try {
    const applications = await Application.find(options).populate([
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
        return res
          .status(201)
          .json({ message: "Create successfully", data: response[1] });
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

    const newInfo = { jobId, status, skillIds, isPriority, attachments };
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
