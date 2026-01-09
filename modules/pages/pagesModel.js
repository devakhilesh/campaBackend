const mongoose = require("mongoose");

const PageSchema = new mongoose.Schema(
  {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    key: String,
    slug: String,
    title: String,

    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String,
      canonical: String,
    },

    content: {
      intro: String,
      sections: [
        {
          heading: String,
          bullets: [String],
        },
      ],
      faqs: [
        {
          q: String,
          a: String,
        },
      ],
    },
  },
  { timestamps: true }
);

const PagesModel = mongoose.model("Page", PageSchema);

module.exports = PagesModel;
