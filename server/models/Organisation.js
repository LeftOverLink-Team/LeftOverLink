const mongoose = require("mongoose");

const organisationSchema = new mongoose.Schema(
    {
        orgName: { type: String, required: true },
        category: {
            type: String,
            enum: [
                "orphanage",
                "old-age-home",
                "special-school",
                "children-home",
                "blind-school",
                "rehab-center",
            ],
            required: true,
        },
        address: { type: String, required: true },
        district: { type: String, required: true },
        state: { type: String, default: "Andhra Pradesh" },
        pincode: { type: String, required: true },
        phone: { type: String, default: null },
        geo: {
            lat: { type: Number, default: null },
            lng: { type: Number, default: null },
            mapLink: { type: String, required: true },
        },
        notifications: {
            receiveFoodAlerts: { type: Boolean, default: true },
            preferredFoodTypes: { type: [String], default: ["cooked", "packaged"] },
            maxDistanceKm: { type: Number, default: 20 },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Organisation", organisationSchema);
