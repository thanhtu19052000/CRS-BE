const express = require('express');
const router = express.Router();
const orderTicketService = require('../services/orderTicketService');
const bookingService = require('../services/bookingService');

router.post('/getOrderList/', async (req, res) => {
    const user_id = req.body.user_id;
    try {   

        const listOrder = await orderTicketService.getOrderListById(user_id);    
        let data = [];

        if (listOrder.length !== 0) {
            Promise.all(listOrder.map(async order => {
                const booking = await bookingService.getBookingById(order.booking_id);

                let object = {
                    id: order._id,
                    typeTicket: booking.booking_type,
                    placeStart: order.pick_point_name,
                    placeStop: order.drop_point_name,
                    timeStart: booking.start_time,
                    timeStop: booking.end_time,
                    seat: order.seats,
                    cost: order.price,
                    status: order.status,
                }

                data.push(object);
                })
            ).then(() => {
                return res.status(201).json({
                    status: "SUCCESS",
                    data
                });    
            })
        } else {
            return res.status(201).json({
                status: "failed",
                data
            });
        }

    } catch (err) {
        console.error("[ERROR] orderTicket/getOrderList [Detail]", err);
        res.status(200).json("ERROR!!!");
    }
});

module.exports = router;