const express = require("express");

const admin = express();

const adminImageUpload = require("../modules/images/imageRoutes");
const adminBrandsRoute = require("../modules/brands/brandRoute");

const adminRoutesRoute = require("../modules/pages/pagesRoutes");
const {
  authenticationAdmin,
  authorizationAdmin,
} = require("../middleware/adminAuth");

admin.use(
  "/admin/imgupload",
  authenticationAdmin,
  authorizationAdmin,
  adminImageUpload
);

admin.use(
  "/admin/brands",
  authenticationAdmin,
  authorizationAdmin,
  adminBrandsRoute
);

admin.use(
  "/admin/pages",
  authenticationAdmin,
  authorizationAdmin,
  adminRoutesRoute
);

module.exports = admin;
