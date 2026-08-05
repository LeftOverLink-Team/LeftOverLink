const express = require("express");
const { searchLocation, reverseLocation } = require("./location.controller");

const router = express.Router();

router.get("/search", searchLocation);
router.get("/reverse", reverseLocation);

module.exports = router;
