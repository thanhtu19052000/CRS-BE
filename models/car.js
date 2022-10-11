const mongoose = require('mongoose');

const carSchema = mongoose.Schema(
    {
        car_name: {
            type: String,
        },
        branch_id: {
            type: String,
        },
        branch_name: {
            type: String,
        },
        car_type_id: {
            type: String
        },
        car_type_name: {
            type: String
        },
        total_seat: {
            type: Number,
        }
    }
);

const CarModel = mongoose.model("cars", carSchema);

module.exports = { CarModel }
