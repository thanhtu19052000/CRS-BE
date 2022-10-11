const mongoose = require('mongoose');

const seatingChartSchema = mongoose.Schema(
    {
        car_id: {
            type: String,
            required: true
        },
        booking_id: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        seat_name: {
            type: String,
            required: true
        },
        key: {
            type: Number,
            required: true
        },
        filled: {
            type: Boolean,
        }
    }
);

const SeatingChartModel = mongoose.model("seatingChart", seatingChartSchema);

module.exports = { SeatingChartModel }
