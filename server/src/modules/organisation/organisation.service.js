const Organisation = require("../../../models/Organisation");

const getAllOrganisations = async () => {
    return await Organisation.find();
};

const getOrganisationById = async (id) => {
    return await Organisation.findById(id);
};

const toggleAlerts = async (id, receiveFoodAlerts) => {
    return await Organisation.findByIdAndUpdate(
        id,
        { "notifications.receiveFoodAlerts": receiveFoodAlerts },
        { new: true }
    );
};

const seedOrganisations = async (data) => {
    await Organisation.deleteMany({});
    return await Organisation.insertMany(data);
};

module.exports = {
    getAllOrganisations,
    getOrganisationById,
    toggleAlerts,
    seedOrganisations,
};
