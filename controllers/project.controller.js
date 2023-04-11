const Project = require("../models/project.model");
const Task = require("../models/task.model");
const User = require("../models/user.model");

const Constant = require("../utils/constant");

// Only return projects that memberId belongs to
module.exports.getProjects = async (req, res) => {
  const userId = req.params.userId;
  const status = req.query?.status || Constant.PROGRESS_STATUS.new;

  try {
    const user = await User.findById(userId).lean();

    if (
      user.role === Constant.USER_ROLE.admin ||
      user.role === Constant.USER_ROLE.manager
    ) {
      const projects = await Project.find({ status });
      res.json(projects);
    } else {
      await Project.find({ status })
        .then(projects => {
          const filteredProjects = projects.filter(project => {
            return project?.memberIds?.some(id => id.valueOf() === userId);
          });

          return res.json(filteredProjects);
        })

        .catch(error => res.status(400).json({ error }));
    }
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.getProjectInfo = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await Project.findById(projectId).lean();

    res.json(project);
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.getMembersOfProject = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const project = await Project.findById(projectId).lean();
    if (!project) {
      return res.status(400).json({ message: "Project not found" });
    }

    await User.find({ _id: { $in: project?.memberIds ?? [] } })
      .select("-password")
      .then((result, error) => {
        if (error) {
          res.status(400).json({ message: "Request failed", error });
        } else {
          res.json(result);
        }
      });
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.postProject = async (req, res) => {
  const { name, description, startDate, endDate, status, creatorId } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const creator = await User.findById(creatorId);

    if (!creator) {
      return res.status(400).json({ message: "Creator Id is not exist" });
    }

    // Only manager and admin have rights to create project
    if (
      [Constant.USER_ROLE.admin, Constant.USER_ROLE.manager].includes(
        creator.role,
      )
    ) {
      const newProject = new Project({
        name,
        creatorId,
        description: description ?? "",
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        status: status ?? Constant.PROGRESS_STATUS.new,
        taskTotal: 0,
        memberIds: [creatorId],
      });

      await Project.create(newProject).then((result, err) => {
        if (err) {
          console.log(err);
          return res.status(400).json({ message: "Create failed" });
        }

        res.status(201).json(result);
      });
    } else {
      return res.status(400).json({
        message: "Only manager and admin have rights to create project",
      });
    }
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.putMembers = async (req, res) => {
  const projectId = req.params.projectId;
  const memberIds = req.body.memberIds;

  try {
    const project = await Project.findById(projectId).lean();

    // 1. Get members need to remove
    const removedMembers = (project?.memberIds ?? []).filter(
      id => !memberIds.includes(id),
    );

    // 2. Reset projectId field of tasks
    const taskPromise = await Task.updateMany(
      { projectId, assigneeId: { $in: removedMembers } },
      { $set: { projectId: null } },
    );

    // 3. Update memberIds in project
    const projectPromise = await Project.findByIdAndUpdate(
      { _id: projectId },
      { memberIds },
    );

    Promise.all([taskPromise, projectPromise])
      .then(() => {
        return res.json({ message: "Update successfully" });
      })
      .catch(err => {
        return res.status(400).json(err);
      });
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.putProjectInfo = async (req, res) => {
  const { name, description, startDate, endDate, status, memberIds } = req.body;
  const projectId = req.params.projectId;

  try {
    await Project.findByIdAndUpdate(
      { _id: projectId },
      {
        name,
        description,
        startDate,
        endDate,
        status,
        memberIds,
      },
    )
      .then(result => {
        if (!result) {
          return res.status(400).json({ message: "Project not found" });
        }

        res.json({ message: "Update project successfully" });
      })
      .catch(err => res.status(400).json(err));
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.addExistTaskToProject = async (req, res) => {
  const projectId = req.params.projectId;
  const { taskIds } = req.body;

  try {
    await Task.updateMany(
      { _id: { $in: taskIds } },
      { $set: { projectId } },
    ).then((result, error) => {
      if (!result) {
        res.status(400).json({
          message: "Update Task failed",
          error,
        });
      } else {
        res.json({
          message: "Update successfully",
        });
      }
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};

module.exports.deleteProject = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    Project.findOneAndDelete({ _id: projectId }).then(result => {
      if (!result) {
        res.status(400).json({
          error: "Delete failed. Maybe project not found",
        });
      } else {
        res.json({
          message: "Delete project successfully",
        });
      }
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};
