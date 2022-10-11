const { BookingModel } = require("../models/booking");

const getBookingByLineList = async (
  start_location,
  end_location,
  startDate,
  endTime
) => {
  try {
    let filter = {
      start_location_name: {
        $regex: start_location,
      },
      end_location_name: {
        $regex: end_location,
      },
      start_time: {
        $gte: startDate,
        $lte: endTime,
      },
    };
    return await BookingModel.find(filter).sort({}).maxTimeMS(1000);
  } catch (err) {
    throw new Error(err);
  }
};

const getBookingByHomeList1 = async (
  start_location_name,
  end_location_name,
  startDate,
  endTime
) => {
  try {
    let filter = {
      // 'start_location_lng': {
      //     $gte: start_location_lng
      // },
      // 'end_location_lat': {
      //     $gte: end_location_lat
      // },
      start_location_name: {
        $regex: start_location_name,
      },
      end_location_name: {
        $regex: end_location_name,
      },
      start_time: {
        $gte: startDate,
        $lte: endTime,
      },
      status: 1,
    };
    return await BookingModel.find(filter).sort({}).maxTimeMS(1000);
  } catch (err) {
    throw new Error(err);
  }
};

const getBookingByHomeList2 = async (
  start_location_lat,
  end_location_lat,
  startDate,
  endTime
) => {
  try {
    let filter = {
      start_location_lat: {
        $gte: start_location_lat,
      },
      end_location_lat: {
        $lte: end_location_lat,
      },
      start_time: {
        $gte: startDate,
        $lte: endTime,
      },
      status: 1,
    };
    return await BookingModel.find(filter).sort({}).maxTimeMS(1000);
  } catch (err) {
    throw new Error(err);
  }
};

const getBookingByHomeList3 = async (
  start_location_lat,
  end_location_name,
  startDate,
  endTime
) => {
  try {
    let filter = {
      start_location_lat: {
        $gte: start_location_lat,
      },
      // 'end_location_lng': {
      //     $lte: end_location_lng
      // },
      // 'start_location_name': {
      //     $regex: start_location_name
      // },
      end_location_name: {
        $regex: end_location_name,
      },
      start_time: {
        $gte: startDate,
        $lte: endTime,
      },
      status: 0,
    };
    return await BookingModel.find(filter).sort({}).maxTimeMS(1000);
  } catch (err) {
    throw new Error(err);
  }
};

const getBookingByDriver = async (rider_id) => {
  try {
    return await BookingModel.findOne({
      rider_id,
      $or: [{ status: 1 }, { status: 2 }],
    });
  } catch (err) {
    throw new Error(err);
  }
};

const getAllBookingByDriver = async (rider_id) => {
  try {
    return await BookingModel.find({ rider_id: rider_id });
  } catch (err) {
    throw new Error(err);
  }
};

const setBooking = async (booking) => {
  const newBooking = new BookingModel(booking);
  try {
    return await newBooking.save();
  } catch (err) {
    throw new Error(err);
  }
};

const updateBooking = async (booking_id, status, car_id, rider_id, avatar) => {
  try {
    return await BookingModel.updateOne(
      { _id: booking_id },
      { status, car_id, rider_id, avatar }
    );
  } catch (err) {
    throw new Error(err);
  }
};

const getRequestBooking = async (
  start_location,
  startDate,
  endTime,
  carType
) => {
  try {
    let filter = {
      start_location_name: {
        $regex: start_location,
      },
      start_time: {
        $gte: startDate,
        $lte: endTime,
      },
      status: 0,
      carType: {
        $eq: carType,
      },
    };
    return await BookingModel.find(filter).sort({}).maxTimeMS(1000);
  } catch (err) {
    throw new Error(err);
  }
};

const updateBookingStatus = async (rider_id, status, newStatus) => {
  try {
    return await BookingModel.updateOne(
      { rider_id, status: status },
      { status: newStatus }
    );
  } catch (err) {
    throw new Error(err);
  }
};

const getBookingById = async (id) => {
  try {
    return await BookingModel.findById(id);
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  getBookingByLineList,
  setBooking,
  getBookingByHomeList1,
  getBookingByHomeList2,
  getRequestBooking,
  updateBooking,
  getBookingByDriver,
  updateBookingStatus,
  getBookingById,
  getBookingByHomeList3,
  getAllBookingByDriver,
};
