const { faker } = require("@faker-js/faker");
const User = require("../../../models/User");
const Food = require("../../../models/Food");
const Order = require("../order/order.model");

// Simulate heatmap data clustered across all major Indian cities AND all of Andhra Pradesh
const CITIES = [
    // Major Indian Hubs
    { name: "Mumbai", lat: 19.0760, lng: 72.8777, radius: 0.20 },
    { name: "Delhi", lat: 28.7041, lng: 77.1025, radius: 0.25 },
    { name: "Bangalore", lat: 12.9716, lng: 77.5946, radius: 0.18 },
    { name: "Chennai", lat: 13.0827, lng: 80.2707, radius: 0.15 },
    { name: "Kolkata", lat: 22.5726, lng: 88.3639, radius: 0.15 },
    { name: "Pune", lat: 18.5204, lng: 73.8567, radius: 0.12 },
    { name: "Ahmedabad", lat: 23.0225, lng: 72.5714, radius: 0.15 },
    
    // Andhra Pradesh & Telangana Hubs
    { name: "Hyderabad", lat: 17.3850, lng: 78.4867, radius: 0.15 },
    { name: "Vijayawada", lat: 16.5062, lng: 80.6480, radius: 0.15 },
    { name: "Visakhapatnam", lat: 17.6868, lng: 83.2185, radius: 0.15 },
    { name: "Guntur", lat: 16.3067, lng: 80.4365, radius: 0.12 },
    { name: "Nellore", lat: 14.4426, lng: 79.9865, radius: 0.12 },
    { name: "Tirupati", lat: 13.6288, lng: 79.4192, radius: 0.12 },
    { name: "Kurnool", lat: 15.8281, lng: 78.0373, radius: 0.12 },
    { name: "Rajahmundry", lat: 17.0005, lng: 81.8040, radius: 0.12 },
    { name: "Kakinada", lat: 16.9891, lng: 82.2475, radius: 0.12 },
    { name: "Anantapur", lat: 14.6819, lng: 77.6006, radius: 0.12 }
];

function generateHeatmapData(type, count) {
    const points = [];
    for (let i = 0; i < count; i++) {
        // Pick a random city to cluster around
        const city = CITIES[Math.floor(Math.random() * CITIES.length)];
        
        // Create 3 main clusters per city for more realistic hotspots
        const clusterOffsetLat = (Math.random() - 0.5) * city.radius;
        const clusterOffsetLng = (Math.random() - 0.5) * city.radius;
        
        // Generate points around cluster centers
        const lat = city.lat + clusterOffsetLat + (Math.random() - 0.5) * (city.radius / 3);
        const lng = city.lng + clusterOffsetLng + (Math.random() - 0.5) * (city.radius / 3);
        
        // Intensity (1-10)
        let intensity = Math.random() * 10;
        if (intensity > 8) intensity *= 1.5; // Boost high intensity points
        
        points.push({
            lat: Number(lat.toFixed(6)),
            lng: Number(lng.toFixed(6)),
            intensity: Number(intensity.toFixed(2))
        });
    }
    return points;
}

const getHeatmapData = (req, res) => {
    try {
        // High point density to cover all of India & AP
        const wastePoints = generateHeatmapData('waste', 800);
        const demandPoints = generateHeatmapData('demand', 500);

        res.json({
            success: true,
            data: {
                waste: wastePoints,
                demand: demandPoints
            }
        });
    } catch (error) {
        console.error('Heatmap generation error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate heatmap data' });
    }
};

const getStats = async (req, res) => {
    try {
        const [totalUsers, activePosts] = await Promise.all([
            User.countDocuments(),
            Food.countDocuments({ status: 'available' }),
        ]);
        const mealAgg = await Order.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, totalMeals: { $sum: '$numberOfMeals' } } }
        ]);
        const totalMeals = mealAgg[0]?.totalMeals || 0;
        const totalOrders = await Order.countDocuments({ paymentStatus: 'completed' });
        res.json({ success: true, data: { totalUsers, totalOrders, totalMeals, activePosts } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to get stats' });
    }
};

module.exports = {
    getHeatmapData,
    getStats,
};
