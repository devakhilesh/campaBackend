const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },

    assets: {
      logo: {
        src: String,
        alt: String,
        width: Number,
        height: Number,
      },
      banner: {
        src: String,
        alt: String,
        width: Number,
        height: Number,
      },
    },

    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String,
      twitterImage: String,
      canonical: String,
    },

    intro: String,

    model: {
      franchise: String,
      dealership: String,
      whichIsLikely: String,
    },

    costSummary: {
      min: String,
      max: String,
      notes: String,
    },

    profitSummary: {
      range: String,
      notes: String,
    },

    eligibility: [String],

    cities: [
      {
        name: String,
        description: String,
      },
    ],

    faqs: [
      {
        q: String,
        a: String,
      },
    ],

    cta: {
      title: String,
      subtitle: String,
      buttonText: String,
      href: String,
    },
    disclaimer: String,
  },
  { timestamps: true }
);

const BrandsModel = mongoose.model("Brand", BrandSchema);

module.exports = BrandsModel;
