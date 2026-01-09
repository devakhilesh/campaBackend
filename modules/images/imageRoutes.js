const express = require("express");
const { uploadImg, getAllImages } = require("./imageController");

const router = express.Router();

router.route("/").post(uploadImg);

router.route("/").get(getAllImages);

module.exports = router;
