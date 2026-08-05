const axios = require("axios");

/**
 * Search location using OpenStreetMap Nominatim
 * @route GET /api/location/search
 */
const searchLocation = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string" || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long",
      });
    }

    // Limit results to 5
    const limit = 5;
    
    // Call Nominatim API
    // User-Agent is strictly required by Nominatim terms of service
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: q.trim(),
        format: "json",
        addressdetails: 1,
        limit: limit,
      },
      headers: {
        "User-Agent": "LeftOverLink/1.0 (contact@leftoverlink.com)",
      },
      // Timeout to prevent hanging
      timeout: 5000,
    });

    // Simplify the response for the frontend
    const results = response.data.map((item) => ({
      display_name: item.display_name,
      city: item.address?.city || item.address?.town || item.address?.village || item.address?.county || "",
      state: item.address?.state || "",
      country: item.address?.country || "",
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Nominatim Search Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    
    // Next will pass to global error handler
    next(error);
  }
};

const reverseLocation = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        format: "json",
        addressdetails: 1,
        zoom: 10,
      },
      headers: {
        "User-Agent": "LeftOverLink/1.0 (contact@leftoverlink.com)",
      },
      timeout: 5000,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Nominatim Reverse Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    next(error);
  }
};

module.exports = {
  searchLocation,
  reverseLocation,
};
