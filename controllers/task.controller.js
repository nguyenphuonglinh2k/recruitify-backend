const Project = require("../models/project.model");
const Task = require("../models/task.model");
const constant = require("../utils/constant");

module.exports.getProjectTasks = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    await Task.find({ projectId })
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
      .populate("projectId")
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
  const status = req.query?.status ?? constant.PROGRESS_STATUS.new;

  try {
    await Task.find({ assigneeId: memberId, _id: taskId, status })
      .populate("projectId")
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

module.exports.getTasksOfAllMemberOfProject = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const project = await Project.findById(projectId).lean();

    if (!project) {
      return res.status(400).json({ message: "Project not found" });
    }

    await Task.find({ assigneeId: { $in: project?.memberIds ?? [] } }).then(
      (result, error) => {
        if (error) {
          return res.status(400).json({ message: "Request failed", error });
        }

        res.json(result);
      },
    );
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

  try {
    const newTask = new Task({
      name,
      description: description ?? "",
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      status,
      progress: progress ?? 0,
      assigneeId,
      projectId: projectId ?? null,
    });

    await Task.create(newTask).then((result, error) => {
      if (error) {
        return res.status(400).json({ message: "Create task failed", error });
      }

      return res
        .status(201)
        .json({ message: "Create task successfully", data: result });
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
    Task.findByIdAndUpdate(
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
    )
      .then(result => {
        if (!result) {
          return res.status(400).json({ message: "Update user failed" });
        }

        res.json({ message: "Update task successfully" });
      })
      .catch(error => res.status(400).json(error));
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.deleteTask = async (req, res) => {
  const taskId = req.params.taskId;

  try {
    await Task.findOneAndDelete({ _id: taskId }).then(result => {
      if (!result) {
        res.status(400).json({
          message: "Delete task failed",
        });
      } else {
        res.json({
          message: "Delete task successfully",
        });
      }
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};
