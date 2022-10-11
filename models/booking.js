const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
    {
        car_id: {
            type: String,
        },
        rider_id: {
            type: String,
        },
        branch_id: {
            type: String,
        },
        booking_type: {
            type: String
        },
        avatar: {
            type: String,
        },
        status: {
            type: Number,
        },
        start_location_name: {
            type: String
        },
        start_location_lat: {
            type: Number
        },
        start_location_lng: {
            type: Number
        },
        end_location_name: {
            type: String
        },
        end_location_lat: {
            type: Number
        },
        end_location_lng: {
            type: Number
        },
        start_time: {
            type: Date,
        },
        end_time: {
            type: Date,
        },
        discount: {
            type: String,
        },
        price: {
            type: Number,
        },
        carType: {
            type: Number,
        }
    }
);

const BookingModel = mongoose.model("bookings", bookingSchema);

module.exports = { BookingModel }
