const express = require("express");
const { getSingleBrandGlobal, getAllBrandsGlobal } = require("./brandsControllers");

const router = express.Router();

router.route("/all").get(getAllBrandsGlobal);

router.route("/:identifier").get(getSingleBrandGlobal);

module.exports = router;
