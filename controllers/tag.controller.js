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
  const { tags } = req.body; // format: {name: ""}

  try {
    const newTagArray = tags;

    console.log(newTagArray);

    await Tag.create(newTagArray).then((_, err) => {
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
  const { tagIds } = req.body;

  try {
    await Tag.deleteMany({ _id: { $nin: tagIds || [] } }).then(
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
