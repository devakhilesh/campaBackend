const BrandsModel = require("./brandsModel");
const slugify = require("slugify");

async function generateUniqueSlug(baseSlug, brandId) {
  let slug = baseSlug;
  let counter = 1;

  while (
    await BrandsModel.findOne({
      slug,
      _id: { $ne: brandId },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

/* =========================================
   CREATE BRAND
========================================= */
exports.brandCreate = async (req, res) => {
  try {
    const payload = req.body || {};
    const errors = [];

    // --- Helper validators ---
    const isNonEmptyString = (v) =>
      typeof v === "string" && v.trim().length > 0;
    const isStringIfProvided = (v) => v === undefined || typeof v === "string";
    const isNumberIfProvided = (v) => v === undefined || typeof v === "number";
    const isArrayIfProvided = (v) => v === undefined || Array.isArray(v);
    const sanitizeStr = (s) => (typeof s === "string" ? s.trim() : s);

    // --- Required: name ---
    if (!isNonEmptyString(payload.name)) {
      errors.push({
        field: "name",
        message: "Brand name is required and must be a non-empty string.",
      });
    }

    // --- Basic type checks for top-level optional fields ---
    if (!isStringIfProvided(payload.slug))
      errors.push({ field: "slug", message: "Slug must be a string." });
    if (!isStringIfProvided(payload.intro))
      errors.push({ field: "intro", message: "Intro must be a string." });
    if (payload.eligibility && !Array.isArray(payload.eligibility)) {
      errors.push({
        field: "eligibility",
        message: "Eligibility must be an array of strings.",
      });
    }

    // --- assets validation (if provided) ---
    if (payload.assets !== undefined) {
      if (typeof payload.assets !== "object" || Array.isArray(payload.assets)) {
        errors.push({ field: "assets", message: "Assets must be an object." });
      } else {
        const { logo, banner } = payload.assets;

        const checkAsset = (asset, name) => {
          if (asset === undefined) return;
          if (typeof asset !== "object" || Array.isArray(asset)) {
            errors.push({
              field: `assets.${name}`,
              message: `${name} must be an object.`,
            });
            return;
          }
          if (asset.src !== undefined && !isNonEmptyString(asset.src)) {
            errors.push({
              field: `assets.${name}.src`,
              message: "src must be a non-empty string.",
            });
          }
          if (asset.alt !== undefined && !isStringIfProvided(asset.alt)) {
            errors.push({
              field: `assets.${name}.alt`,
              message: "alt must be a string.",
            });
          }
          if (asset.width !== undefined && typeof asset.width !== "number") {
            errors.push({
              field: `assets.${name}.width`,
              message: "width must be a number.",
            });
          }
          if (asset.height !== undefined && typeof asset.height !== "number") {
            errors.push({
              field: `assets.${name}.height`,
              message: "height must be a number.",
            });
          }
        };

        checkAsset(logo, "logo");
        checkAsset(banner, "banner");
      }
    }

    // --- seo validation ---
    if (payload.seo !== undefined) {
      if (typeof payload.seo !== "object" || Array.isArray(payload.seo)) {
        errors.push({ field: "seo", message: "seo must be an object." });
      } else {
        if (
          payload.seo.title !== undefined &&
          !isStringIfProvided(payload.seo.title)
        )
          errors.push({
            field: "seo.title",
            message: "seo.title must be a string.",
          });
        if (
          payload.seo.description !== undefined &&
          !isStringIfProvided(payload.seo.description)
        )
          errors.push({
            field: "seo.description",
            message: "seo.description must be a string.",
          });
        if (payload.seo.keywords !== undefined) {
          if (Array.isArray(payload.seo.keywords) === false) {
            // allow comma-separated string too
            if (isNonEmptyString(payload.seo.keywords)) {
              payload.seo.keywords = payload.seo.keywords
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean);
            } else {
              errors.push({
                field: "seo.keywords",
                message:
                  "seo.keywords must be an array of strings or a comma-separated string.",
              });
            }
          } else {
            // ensure each keyword is string
            if (!payload.seo.keywords.every((k) => typeof k === "string")) {
              errors.push({
                field: "seo.keywords",
                message: "Each seo.keyword must be a string.",
              });
            }
          }
        }
        if (
          payload.seo.ogImage !== undefined &&
          !isStringIfProvided(payload.seo.ogImage)
        )
          errors.push({
            field: "seo.ogImage",
            message: "seo.ogImage must be a string.",
          });
        if (
          payload.seo.twitterImage !== undefined &&
          !isStringIfProvided(payload.seo.twitterImage)
        )
          errors.push({
            field: "seo.twitterImage",
            message: "seo.twitterImage must be a string.",
          });
        if (
          payload.seo.canonical !== undefined &&
          !isStringIfProvided(payload.seo.canonical)
        )
          errors.push({
            field: "seo.canonical",
            message: "seo.canonical must be a string.",
          });
      }
    }

    // --- model validation (simple string checks) ---
    if (payload.model !== undefined) {
      if (typeof payload.model !== "object" || Array.isArray(payload.model)) {
        errors.push({ field: "model", message: "model must be an object." });
      } else {
        ["franchise", "dealership", "whichIsLikely"].forEach((k) => {
          if (
            payload.model[k] !== undefined &&
            !isStringIfProvided(payload.model[k])
          ) {
            errors.push({
              field: `model.${k}`,
              message: `${k} must be a string.`,
            });
          }
        });
      }
    }

    // --- costSummary & profitSummary simple checks ---
    if (payload.costSummary !== undefined) {
      if (
        typeof payload.costSummary !== "object" ||
        Array.isArray(payload.costSummary)
      ) {
        errors.push({
          field: "costSummary",
          message: "costSummary must be an object.",
        });
      } else {
        ["min", "max", "notes"].forEach((k) => {
          if (
            payload.costSummary[k] !== undefined &&
            !isStringIfProvided(payload.costSummary[k])
          ) {
            errors.push({
              field: `costSummary.${k}`,
              message: `${k} must be a string.`,
            });
          }
        });
      }
    }

    if (payload.profitSummary !== undefined) {
      if (
        typeof payload.profitSummary !== "object" ||
        Array.isArray(payload.profitSummary)
      ) {
        errors.push({
          field: "profitSummary",
          message: "profitSummary must be an object.",
        });
      } else {
        ["range", "notes"].forEach((k) => {
          if (
            payload.profitSummary[k] !== undefined &&
            !isStringIfProvided(payload.profitSummary[k])
          ) {
            errors.push({
              field: `profitSummary.${k}`,
              message: `${k} must be a string.`,
            });
          }
        });
      }
    }

    // --- cities & faqs validation ---
    if (payload.cities !== undefined) {
      if (!Array.isArray(payload.cities)) {
        errors.push({ field: "cities", message: "cities must be an array." });
      } else {
        payload.cities.forEach((c, idx) => {
          if (typeof c !== "object" || Array.isArray(c)) {
            errors.push({
              field: `cities[${idx}]`,
              message: "Each city must be an object.",
            });
          } else {
            if (c.name !== undefined && !isNonEmptyString(c.name))
              errors.push({
                field: `cities[${idx}].name`,
                message: "City name must be a non-empty string.",
              });
            if (
              c.description !== undefined &&
              !isStringIfProvided(c.description)
            )
              errors.push({
                field: `cities[${idx}].description`,
                message: "City description must be a string.",
              });
          }
        });
      }
    }

    if (payload.faqs !== undefined) {
      if (!Array.isArray(payload.faqs)) {
        errors.push({ field: "faqs", message: "faqs must be an array." });
      } else {
        payload.faqs.forEach((f, idx) => {
          if (typeof f !== "object" || Array.isArray(f)) {
            errors.push({
              field: `faqs[${idx}]`,
              message: "Each faq must be an object.",
            });
          } else {
            if (!isNonEmptyString(f.q))
              errors.push({
                field: `faqs[${idx}].q`,
                message:
                  "Question (q) is required and must be a non-empty string.",
              });
            if (!isNonEmptyString(f.a))
              errors.push({
                field: `faqs[${idx}].a`,
                message:
                  "Answer (a) is required and must be a non-empty string.",
              });
          }
        });
      }
    }

    // --- cta & disclaimer ---
    if (payload.cta !== undefined) {
      if (typeof payload.cta !== "object" || Array.isArray(payload.cta)) {
        errors.push({ field: "cta", message: "cta must be an object." });
      } else {
        ["title", "subtitle", "buttonText", "href"].forEach((k) => {
          if (
            payload.cta[k] !== undefined &&
            !isStringIfProvided(payload.cta[k])
          ) {
            errors.push({
              field: `cta.${k}`,
              message: `${k} must be a string.`,
            });
          }
        });
      }
    }

    if (
      payload.disclaimer !== undefined &&
      !isStringIfProvided(payload.disclaimer)
    ) {
      errors.push({
        field: "disclaimer",
        message: "disclaimer must be a string.",
      });
    }

    // --- If any validation errors, return ---
    if (errors.length > 0) {
      return res
        .status(400)
        .json({ status: false, message: "Validation failed", errors });
    }

    // --- sanitize some top-level strings ---
    payload.name = sanitizeStr(payload.name);
    if (payload.intro) payload.intro = sanitizeStr(payload.intro);

    // --- slug generation & uniqueness check ---
    let baseSlug =
      payload.slug && isNonEmptyString(payload.slug)
        ? slugify(payload.slug, { lower: true, strict: true })
        : slugify(payload.name, { lower: true, strict: true });
    let slugToUse = baseSlug;

    // ensure unique slug (if exists, append short suffix)
    const slugExists = await BrandsModel.findOne({ slug: slugToUse });
    if (slugExists) {
      const suffix = Math.random().toString(36).slice(2, 7);
      slugToUse = `${baseSlug}-${suffix}`;
    }
    payload.slug = slugToUse;

    // --- create brand ---
    // Only include fields that exist in payload (so unspecified fields are left out)
    const brandDoc = new BrandsModel(payload);

    // run mongoose validators on save (if defined in schema)
    const saved = await brandDoc.save();

    return res.status(201).json({
      status: true,
      message: "Brand created successfully",
      data: saved,
    });
  } catch (err) {
    // handle duplicate key errors separately (just in case)
    if (err.code === 11000) {
      return res.status(409).json({
        status: false,
        message: "Duplicate key error",
        detail: err.keyValue,
      });
    }
    return res.status(500).json({ status: false, message: err.message });
  }
};

/* =========================================
   UPDATE BRAND
========================================= */
exports.brandUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};
    const errors = [];

    // --- helpers ---
    const isNonEmptyString = (v) =>
      typeof v === "string" && v.trim().length > 0;
    const isStringIfProvided = (v) => v === undefined || typeof v === "string";

    // --- check brand exists ---
    const existingBrand = await BrandsModel.findById(id);
    if (!existingBrand) {
      return res.status(404).json({
        status: false,
        message: "Brand not found",
      });
    }

    /* ===============================
       VALIDATIONS (only provided)
    =============================== */

    if (payload.name !== undefined && !isNonEmptyString(payload.name)) {
      errors.push({
        field: "name",
        message: "Brand name must be a non-empty string",
      });
    }

    if (payload.slug !== undefined && !isNonEmptyString(payload.slug)) {
      errors.push({
        field: "slug",
        message: "Slug must be a non-empty string",
      });
    }

    if (payload.intro !== undefined && !isStringIfProvided(payload.intro)) {
      errors.push({
        field: "intro",
        message: "Intro must be a string",
      });
    }

    if (
      payload.eligibility !== undefined &&
      !Array.isArray(payload.eligibility)
    ) {
      errors.push({
        field: "eligibility",
        message: "Eligibility must be an array",
      });
    }

    // --- validate nested arrays ---
    if (payload.faqs !== undefined) {
      if (!Array.isArray(payload.faqs)) {
        errors.push({ field: "faqs", message: "Faqs must be an array" });
      } else {
        payload.faqs.forEach((f, i) => {
          if (!isNonEmptyString(f?.q) || !isNonEmptyString(f?.a)) {
            errors.push({
              field: `faqs[${i}]`,
              message: "Faq must have non-empty q and a",
            });
          }
        });
      }
    }

    if (payload.cities !== undefined) {
      if (!Array.isArray(payload.cities)) {
        errors.push({ field: "cities", message: "Cities must be an array" });
      } else {
        payload.cities.forEach((c, i) => {
          if (!isNonEmptyString(c?.name)) {
            errors.push({
              field: `cities[${i}].name`,
              message: "City name is required",
            });
          }
        });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Validation failed",
        errors,
      });
    }

    /* ===============================
       SLUG HANDLING
    =============================== */

    if (payload.name || payload.slug) {
      const baseSlug = payload.slug
        ? slugify(payload.slug, { lower: true, strict: true })
        : slugify(payload.name, { lower: true, strict: true });

      payload.slug = await generateUniqueSlug(baseSlug, id);
    }

    /* ===============================
       UPDATE (only provided fields)
    =============================== */

    const updatedBrand = await BrandsModel.findByIdAndUpdate(
      id,
      { $set: payload },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      status: true,
      message: "Brand updated successfully",
      data: updatedBrand,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        status: false,
        message: "Duplicate slug already exists",
      });
    }
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

/* ===============================
   GET ALL BRANDS
================================ */
exports.getAllBrands = async (req, res) => {
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
   GET SINGLE BRAND
================================ */
exports.getSingleBrand = async (req, res) => {
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

    return res.status(200).json({
      status: true,
      data: brand,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

/* ===============================
   DELETE BRAND
================================ */
exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBrand = await BrandsModel.findByIdAndDelete(id);

    if (!deletedBrand) {
      return res.status(404).json({
        status: false,
        message: "Brand not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Brand deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
