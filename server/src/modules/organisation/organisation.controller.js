const organisationService = require("./organisation.service");

const getOrganisations = async (req, res, next) => {
    try {
        const orgs = await organisationService.getAllOrganisations();
        res.json(orgs);
    } catch (err) {
        next(err);
    }
};

const getOrganisation = async (req, res, next) => {
    try {
        const org = await organisationService.getOrganisationById(req.params.id);
        if (!org) {
            return res.status(404).json({ message: "Organisation not found" });
        }
        res.json(org);
    } catch (err) {
        next(err);
    }
};

const updateAlertSettings = async (req, res, next) => {
    try {
        const { receiveFoodAlerts } = req.body;
        const org = await organisationService.toggleAlerts(req.params.id, receiveFoodAlerts);
        if (!org) {
            return res.status(404).json({ message: "Organisation not found" });
        }
        res.json(org);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getOrganisations,
    getOrganisation,
    updateAlertSettings,
};
