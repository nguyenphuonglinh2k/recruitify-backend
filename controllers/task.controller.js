const moment = require("moment");
const Project = require("../models/project.model");
const Task = require("../models/task.model");
const constant = require("../utils/constant");

module.exports.getProjectTasks = async (req, res) => {
  const projectId = req.params.projectId;
  const { status, memberId } = req.query;

  const queryOptions = { projectId };

  if (status) {
    queryOptions.status = status;
  }
  if (memberId) {
    queryOptions.assigneeId = memberId;
  }

  try {
    await Task.find(queryOptions)
      .populate([
        { path: "assigneeId", select: "-password" },
        { path: "projectId" },
      ])
      .then((results, error) => {
        if (results) {
          return res.json(results);
        } else {
          return res.status(400).json(error);
        }
      })
      .catch(error => res.status(400).json(error));
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.getWeeklyTaskStatistics = async (req, res) => {
  const userId = req.params.memberId;

  const monday = new Date(
    moment()
      .startOf("isoWeek")
      .add(0, "days")
      .format(constant.FORMAT_DATE_WITH_HYPHEN),
  );

  const tuesday = new Date(
    moment()
      .startOf("isoWeek")
      .add(1, "days")
      .format(constant.FORMAT_DATE_WITH_HYPHEN),
  );

  const wednesday = new Date(
    moment()
      .startOf("isoWeek")
      .add(2, "days")
      .format(constant.FORMAT_DATE_WITH_HYPHEN),
  );

  const thursday = new Date(
    moment()
      .startOf("isoWeek")
      .add(3, "days")
      .format(constant.FORMAT_DATE_WITH_HYPHEN),
  );

  const friday = new Date(
    moment()
      .startOf("isoWeek")
      .add(4, "days")
      .format(constant.FORMAT_DATE_WITH_HYPHEN),
  );

  try {
    const mondayTasksPromise = Task.find({
      assigneeId: userId,
      startDate: { $lte: monday },
      endDate: { $gte: monday },
    });
    const tuesdayTasksPromise = Task.find({
      assigneeId: userId,
      startDate: { $lte: tuesday },
      endDate: { $gte: tuesday },
    });
    const wednesdayTasksPromise = Task.find({
      assigneeId: userId,
      startDate: { $lte: wednesday },
      endDate: { $gte: wednesday },
    });
    const thursdayTasksPromise = Task.find({
      assigneeId: userId,
      startDate: { $lte: thursday },
      endDate: { $gte: thursday },
    });
    const fridayTasksPromise = Task.find({
      assigneeId: userId,
      startDate: { $lte: friday },
      endDate: { $gte: friday },
    });

    await Promise.all([
      mondayTasksPromise,
      tuesdayTasksPromise,
      wednesdayTasksPromise,
      thursdayTasksPromise,
      fridayTasksPromise,
    ])
      .then(responses =>
        res.json({
          monday: responses[0].length,
          tuesday: responses[1].length,
          wednesday: responses[2].length,
          thursday: responses[3].length,
          friday: responses[4].length,
        }),
      )
      .catch(error => res.status(400).json(error));
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.getTodayTaskOfMember = async (req, res) => {
  const memberId = req.params.memberId;
  const status = req.query?.status ?? constant.PROGRESS_STATUS.new;

  const today = moment().format("YYYY-MM-DD");

  try {
    await Task.find({
      assigneeId: memberId,
      status,
      startDate: { $lte: new Date(today) },
      endDate: { $gte: new Date(today) },
    })
      .populate([
        { path: "projectId" },
        { path: "assigneeId", select: "-password" },
      ])
      .then((results, error) => {
        if (results) {
          return res.json(results);
        } else {
          return res.status(400).json(error);
        }
      })
      .catch(error => res.status(400).json(error));
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.getTasksOfMember = async (req, res) => {
  const memberId = req.params.memberId;
  const status = req.query?.status ?? constant.PROGRESS_STATUS.new;

  try {
    await Task.find({ assigneeId: memberId, status })
      .populate([
        { path: "projectId" },
        { path: "assigneeId", select: "-password" },
      ])
      .then((results, error) => {
        if (results) {
          return res.json(results);
        } else {
          return res.status(400).json(error);
        }
      })
      .catch(error => res.status(400).json(error));
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.getTaskDetailOfMember = async (req, res) => {
  const { memberId, taskId } = req.params;

  try {
    await Task.findOne({ assigneeId: memberId, _id: taskId })
      .populate([
        { path: "assigneeId", select: "-password" },
        { path: "projectId" },
      ])
      .then((result, error) => {
        if (result) {
          return res.json(result);
        } else {
          return res.status(400).json(error);
        }
      })
      .catch(error => res.status(400).json(error));
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.getTasksOfAllMemberNotInProject = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const project = await Project.findById(projectId).lean();

    if (!project) {
      return res.status(400).json({ message: "Project not found" });
    }

    await Task.find({
      assigneeId: { $in: project?.memberIds ?? [] },
      projectId: null,
    })
      .populate([
        { path: "projectId" },
        { path: "assigneeId", select: "-password" },
      ])
      .then((result, error) => {
        if (error) {
          return res.status(400).json({ message: "Request failed", error });
        }

        res.json(result);
      });
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.postTask = async (req, res) => {
  const {
    name,
    description,
    startDate,
    endDate,
    status,
    progress,
    assigneeId,
    projectId,
  } = req.body;

  if (!name || !status || !assigneeId) {
    return res.status(400).json({ message: "Miss required fields" });
  }

  const promises = [];

  try {
    const newTask = new Task({
      name,
      description: description ?? "",
      startDate: new Date(startDate) ?? null,
      endDate: new Date(endDate) ?? null,
      status,
      progress: progress ?? 0,
      assigneeId,
      projectId: projectId ?? null,
    });

    const createTaskPromise = Task.create(newTask);
    promises.push(createTaskPromise);

    if (projectId) {
      const updateProjectPromise = Project.findByIdAndUpdate(
        { _id: projectId },
        { $inc: { taskTotal: 1 } },
      );
      promises.push(updateProjectPromise);
    }

    Promise.all(promises)
      .then(responses => {
        return res.status(201).json({
          message: "Create task successfully",
          data: responses[0],
        });
      })
      .catch(err => {
        return res.status(400).json(err);
      });
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.putTask = async (req, res) => {
  const { name, projectId, progress, status, startDate, endDate, description } =
    req.body;
  const taskId = req.params.taskId;

  try {
    const task = await Task.findById(taskId).lean();
    const prevProjectId = task.projectId;
    const promises = [];

    const updateTaskPromise = Task.findByIdAndUpdate(
      { _id: taskId },
      {
        name,
        progress,
        status,
        startDate,
        endDate,
        description,
        projectId,
      },
      { new: true },
    );
    promises.push(updateTaskPromise);

    if (projectId && prevProjectId && prevProjectId !== projectId) {
      const updatePrevProjectPromise = Project.findByIdAndUpdate(
        { _id: prevProjectId },
        { $inc: { taskTotal: -1 } },
      );

      const updateNextProjectPromise = Project.findByIdAndUpdate(
        { _id: projectId },
        { $inc: { taskTotal: 1 } },
      );

      promises.push(updatePrevProjectPromise, updateNextProjectPromise);
      // !prevProjectId && !projectId -> skip
      // !prevProjectId && projectId -> update projectId
      // prevProjectId && projectId -> update both
    } else if (!prevProjectId && projectId) {
      const updateNextProjectPromise = Project.findByIdAndUpdate(
        { _id: projectId },
        { $inc: { taskTotal: 1 } },
      );

      promises.push(updateNextProjectPromise);
    }

    Promise.all(promises)
      .then(responses => {
        return res.json({
          message: "Update task successfully",
          data: responses[0],
        });
      })
      .catch(err => {
        return res
          .status(400)
          .json({ message: "Update task failed", error: err });
      });
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.deleteTask = async (req, res) => {
  const taskId = req.params.taskId;

  try {
    const task = await Task.findById(taskId).lean();
    const projectId = task.projectId;
    const promises = [];

    const deleteTaskPromise = Task.findOneAndDelete({ _id: taskId });
    promises.push(deleteTaskPromise);

    if (projectId) {
      const updateProjectPromise = Project.findByIdAndUpdate(
        { _id: projectId },
        { $inc: { taskTotal: -1 } },
      );
      promises.push(updateProjectPromise);
    }

    Promise.all(promises)
      .then(() => {
        return res.json({
          message: "Delete task successfully",
        });
      })
      .catch(err => {
        return res
          .status(400)
          .json({ message: "Delete task failed", error: err });
      });
  } catch (error) {
    return res.status(400).json(error);
  }
};
