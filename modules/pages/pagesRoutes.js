const express = require("express");
const {
  createPages,
  updatePage,
  getAllPages,
  getSinglePage,
  deletePage,
} = require("./pagesController");

const router = express.Router();

router.route("/:brandId").post(createPages);

router.route("/:id").put(updatePage);

router.route("/:brandId").get(getAllPages);

router.route("/:identifier").get(getSinglePage);

router.route("/:id").delete(deletePage);

module.exports = router;
