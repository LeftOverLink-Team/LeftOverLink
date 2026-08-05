const express = require("express");
const organisationController = require("./organisation.controller");

const router = express.Router();

router.get("/", organisationController.getOrganisations);
router.get("/:id", organisationController.getOrganisation);
router.post("/:id/enable-alerts", organisationController.updateAlertSettings);

module.exports = router;
