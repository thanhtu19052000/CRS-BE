const mongoose = require('mongoose');

const locationSchema = mongoose.Schema(
    {
        province: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        }
    }
);

const LocationModel = mongoose.model("locations", locationSchema);

module.exports = { LocationModel }
