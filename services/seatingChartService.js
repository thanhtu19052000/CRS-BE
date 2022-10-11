const { SeatingChartModel } = require('../models/seatingChart');

const getByBooking = async (booking_id, car_id, date) => {
    try {
        let filter = {
            'booking_id': {$regex: booking_id},
            'car_id': {$regex: car_id},
            'date': {$regex: date}
        };
        return await SeatingChartModel.find(filter).sort({}).maxTimeMS(1000);
    } catch (err) {
        throw new Error(err);
    }
}

const setChart = async (chart) => {
    const newChart = new SeatingChartModel(chart);
    try {
        return await newChart.save();
    } catch (err) {
        throw new Error(err);
    }
}

const updateSeat = async (booking_id, car_id, date, seat_name) => {
    try {
        return await SeatingChartModel.updateOne({ booking_id, car_id, date, seat_name }, { filled: true });
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = {
    getByBooking,
    setChart,
    updateSeat
}