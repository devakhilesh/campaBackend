const PagesModel = require("../../pages/pagesModel");

exports.getSinglePageGlobal = async (req, res) => {
  try {
    const { identifier } = req.params;

    const page = await PagesModel.findOne({
      $or: [{ _id: identifier }, { slug: identifier }],
    }).populate("brand", "name slug");

    if (!page) {
      return res.status(404).json({
        status: false,
        message: "Page not found",
      });
    }

    return res.status(200).json({
      status: true,
      data: page,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
