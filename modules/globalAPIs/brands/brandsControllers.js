const BrandsModel = require("../../brands/brandsModel");
const PagesModel = require("../../pages/pagesModel");

/* ===============================
   GET ALL BRANDS
================================ */
exports.getAllBrandsGlobal = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const brands = await BrandsModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BrandsModel.countDocuments();

    return res.status(200).json({
      status: true,
      data: brands,
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

/* ===============================
   GET SINGLE BRAND (WITH PAGES)
================================ */

exports.getSingleBrandGlobal = async (req, res) => {
  try {
    const { identifier } = req.params;

    const brand = await BrandsModel.findOne({
      $or: [{ _id: identifier }, { slug: identifier }],
    });

    if (!brand) {
      return res.status(404).json({
        status: false,
        message: "Brand not found",
      });
    }

    const pages = await PagesModel.find({ brand: brand._id })
      .select("_id title slug key createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      data: {
        brand,
        pages,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
