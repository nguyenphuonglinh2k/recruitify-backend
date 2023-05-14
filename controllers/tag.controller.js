const Tag = require("../models/tag.model");

module.exports.getTags = async (_, res) => {
  try {
    const tags = await Tag.find();
    res.json(tags);
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.postTags = async (req, res) => {
  const { tags } = req.body; // format: tags = [{name: ""}]

  try {
    await Tag.create(tags).then((_, err) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "Create tag is failed", error: err });
      }

      return res.status(201).json({ message: "Create tag successfully" });
    });
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.putTags = async (req, res) => {
  const { name } = req.body;
  const tagId = req.params.tagId;

  try {
    await Tag.findByIdAndUpdate({ _id: tagId }, { name }, { new: true }).then(
      (result, error) => {
        if (error) {
          res.status(400).json({ message: "Update tags failed", error });
        }

        res.json({ message: "Update tags successfully", data: result });
      },
    );
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports.deleteTag = async (req, res) => {
  // TODO: delete all tag in job, candidate,...
  const tagId = req.params.tagId;

  try {
    await Tag.findByIdAndDelete(tagId).then((_, error) => {
      if (error) {
        res.status(400).json({ message: "Delete failed", error });
      }

      res.json({ message: "Delete successfully" });
    });
  } catch (error) {
    res.status(400).json(error);
  }
};
