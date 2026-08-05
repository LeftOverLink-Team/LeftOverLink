// For v1 of the industry-grade refactor we reuse the existing Food model
// to stay compatible with the current frontend payload shape.
// Advanced geo indexes can be added directly on the original schema.
const Food = require("../../../models/Food");

module.exports = Food;


