const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["apply", "contact", "brand_apply", "callback"],
    required: true,
    index: true,
  },

  name: { type: String, required: true },
  phone: { type: String, required: true, index: true },
  email: String,
  city: String,
  budget: String,
  message: String,

  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
  },

  page: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Page",
  },

  source: {
    type: String, // website / landing-page / campaign
    default: "website",
  },

  status: {
    type: String,
    enum: ["new", "contacted", "qualified", "closed"],
    default: "new",
    index: true,
  },
}, { timestamps: true });

const LeadModel = mongoose.model("Lead", LeadSchema);
module.exports = LeadModel