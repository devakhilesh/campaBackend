const express = require("express");

const global = express();

const globalBrandsRoute = require("../modules/globalAPIs/brands/brandsRoute");
const globalPagesRoute = require("../modules/globalAPIs/pages/pagesRoute");

global.use("/global/brands", globalBrandsRoute);

global.use("/global/pages", globalPagesRoute);

module.exports = global;
