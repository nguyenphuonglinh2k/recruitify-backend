const Project = require("../models/project.model");
const User = require("../models/user.model");
const Constant = require("../utils/constant");

// Only return projects that memberId belongs to
module.exports.getProjects = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId).lean();

    if (
      user.role === Constant.USER_ROLE.admin ||
      user.role === Constant.USER_ROLE.manager
    ) {
      const projects = await Project.find();
      res.json(projects);
    } else {
      await Project.find()
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
  const { projectId, userId } = req.params;

  try {
    const project = await Project.findById(projectId).lean();
    const user = await User.findById(userId);

    if (
      user.role === Constant.USER_ROLE.admin ||
      user.role === Constant.USER_ROLE.manager ||
      project.memberIds?.includes(userId)
    ) {
      res.json(project);
    } else {
      res.status(400).json({ message: "Don't have permission to access" });
    }
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
        memberIds: [],
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
