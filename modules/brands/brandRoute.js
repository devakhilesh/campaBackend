const express = require("express")
const { brandCreate, brandUpdate, getAllBrands, getSingleBrand, deleteBrand } = require("./brandControllers")

const router = express.Router()


router.route("/").post(brandCreate)

router.route("/:id").put(brandUpdate)

router.route("/all").get(getAllBrands)

router.route("/:identifier").get(getSingleBrand)

router.route("/:id").delete(deleteBrand)



module.exports = router