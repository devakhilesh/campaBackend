const adminModel = require("./adminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* ======================================
   REGISTER ADMIN
====================================== */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ---- validations ----
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        status: false,
        message: "Name is required",
      });
    }

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        status: false,
        message: "Email is required",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        status: false,
        message: "Password must be at least 6 characters",
      });
    }

    // ---- check email exists ----
    const existingAdmin = await adminModel.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({
        status: false,
        message: "Admin already exists with this email",
      });
    }

    // ---- hash password ----
    const hashedPassword = await bcrypt.hash(password, 10);

    // ---- create admin ----
    const admin = await adminModel.create({
      name,
      email,
      password: hashedPassword,
      role: role || "admin",
    });

    return res.status(201).json({
      status: true,
      message: "Admin registered successfully",
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

/* ======================================
   LOGIN ADMIN
====================================== */
exports.logIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ---- validations ----
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required",
      });
    }

    // ---- find admin ----
    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // ---- compare password ----
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    // ---- generate token ----
    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      status: true,
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
