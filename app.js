require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors());

// express file upload middi
app.use(
  fileUpload({
    limits: { fileSize: 20 * 1024 * 1024 },
  })
);

//coludinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});




mongoose
  .connect(process.env.MONGODB_URL_LOCAL)
  .then(() => {
    console.log(`mongodb connected successfully`);
  })
  .catch((err) => {
    console.log(err.message);
  });

module.exports = app;
