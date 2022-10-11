const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
    {
        user_id: {
            type: String
        },
        status: {
            type: Number
        },
        booking_id: {
            type: String,
        },
        user_name: {
            type: String,
        },
        phone_number: {
            type: String,
        },
        seats: {
            type: Array
        },
        pick_point_name: {
            type: String
        },
        pick_point_lat: {
            type: Number
        },
        pick_point_lng: {
            type: Number
        },
        drop_point_name: {
            type: String
        },
        drop_point_lat: {
            type: Number
        },
        drop_point_lng: {
            type: Number
        },
        create_date: {
            type: Date
        },
        price: {
            type: Number
        },
        distance: {
            type: Number
        }
    }
);

const OrderTicketModel = mongoose.model("orderTicket", orderSchema);

module.exports = { OrderTicketModel }
