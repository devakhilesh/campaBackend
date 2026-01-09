const express = require("express");
const { getSinglePageGlobal } = require("./pagesControllers");

const router = express.Router();

router.route("/:identifier").get(getSinglePageGlobal);

module.exports = router;
