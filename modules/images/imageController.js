const { uploadSingleImage } = require("../../utils/fileUpload");
const ImageModel = require("./imageModel");

// upload Image

exports.uploadImg = async (req, res) => {
  try {
    const data = req.body;

    const { info } = data;

    if (!req.files || !req.files.img) {
      return res
        .status(400)
        .json({ status: false, message: "Kindly Provide Image" });
    }

    const fileUpload = req.files.img;

    const folder = "blog_img";

    const upload = await uploadSingleImage(fileUpload, folder);

    if (!upload.status) {
      return res.status(400).json({ status: false, message: upload.message });
    }

    data.img = upload.data;

    const saveImg = await ImageModel.create(data);
    if (!saveImg) {
      return res.status(400).json({
        status: false,
        message: "something wents wrong while storing this image",
      });
    }

    return res.status(201).json({ status: true, message: "image uploaded successfully", data:saveImg });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

// get All Images

exports.getAllImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // fetch images
    const images = await ImageModel.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ImageModel.countDocuments();

    return res.status(200).json({
      status: true,
      message: "Images fetched successfully",
      data: images,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
