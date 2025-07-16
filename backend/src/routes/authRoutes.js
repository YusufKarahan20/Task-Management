const express = require("express");
const router = express.Router();
const { register, me} = require("../controllers/authController");
const verifyUser = require("../middleware/verifyUser");

router.post("/register", register);
router.get("/me", verifyUser, me);

module.exports = router;