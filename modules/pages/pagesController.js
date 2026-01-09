const PagesModel = require("./pagesModel");
const mongoose = require("mongoose");
const slugify = require("slugify");

/* ======================================
   helper → unique slug per brand
====================================== */
async function generateUniqueSlug(baseSlug, brandId, pageId = null) {
  let slug = baseSlug;
  let counter = 1;

  while (
    await PagesModel.findOne({
      slug,
      brand: brandId,
      ...(pageId ? { _id: { $ne: pageId } } : {}),
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

/* ======================================
   CREATE PAGE
====================================== */
exports.createPages = async (req, res) => {
  try {
    const { brandId } = req.params;
    const payload = req.body || [];
    const errors = [];

    // ---- brand validation ----
    if (!mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid brandId",
      });
    }

    // ---- required fields ----
    if (!payload.title || typeof payload.title !== "string") {
      errors.push({ field: "title", message: "Title is required" });
    }

    if (!payload.key || typeof payload.key !== "string") {
      errors.push({ field: "key", message: "Key is required" });
    }

    // ---- content validation ----
    if (payload.content?.sections) {
      if (!Array.isArray(payload.content.sections)) {
        errors.push({
          field: "content.sections",
          message: "Sections must be array",
        });
      }
    }

    if (payload.content?.faqs) {
      if (!Array.isArray(payload.content.faqs)) {
        errors.push({ field: "content.faqs", message: "Faqs must be array" });
      }
    }

    if (errors.length) {
      return res.status(400).json({
        status: false,
        message: "Validation failed",
        errors,
      });
    }

    // ---- slug handling ----
    const baseSlug = payload.slug
      ? slugify(payload.slug, { lower: true, strict: true })
      : slugify(payload.title, { lower: true, strict: true });

    const uniqueSlug = await generateUniqueSlug(baseSlug, brandId);

    payload.slug = uniqueSlug;
    payload.brand = brandId;

    const page = await PagesModel.create(payload);

    return res.status(201).json({
      status: true,
      message: "Page created successfully",
      data: page,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        status: false,
        message: "Duplicate page key or slug",
      });
    }
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

//============update pages =============

exports.updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || [];

    const existingPage = await PagesModel.findById(id);
    if (!existingPage) {
      return res.status(404).json({
        status: false,
        message: "Page not found",
      });
    }

    // ---- slug regeneration ----
    if (payload.title || payload.slug) {
      const baseSlug = payload.slug
        ? slugify(payload.slug, { lower: true, strict: true })
        : slugify(payload.title, { lower: true, strict: true });

      payload.slug = await generateUniqueSlug(baseSlug, existingPage.brand, id);
    }

    const updatedPage = await PagesModel.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      status: true,
      message: "Page updated successfully",
      data: updatedPage,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

// get All Pages

exports.getAllPages = async (req, res) => {
  try {
    const { brandId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pages = await PagesModel.find({ brand: brandId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PagesModel.countDocuments({ brand: brandId });

    return res.status(200).json({
      status: true,
      data: pages,
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

//========== get Single Pages ==========

exports.getSinglePage = async (req, res) => {
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

// ============ delete pages ===========

exports.deletePage = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await PagesModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        status: false,
        message: "Page not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Page deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
