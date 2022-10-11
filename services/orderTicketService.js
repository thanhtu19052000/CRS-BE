const { OrderTicketModel } = require("../models/orderTicket");

const getOrderList = async () => {
  try {
    let filter = {};
    return await OrderTicketModel.find(filter).sort({}).maxTimeMS(1000);
  } catch (err) {
    throw new Error(err);
  }
};

const getOrderListById = async (user_id) => {
  try {
    let filter = {
      user_id: {
        $regex: user_id,
      },
    };
    return await OrderTicketModel.find(filter).sort({}).maxTimeMS(1000);
  } catch (err) {
    throw new Error(err);
  }
};

const setOrderTicket = async (orderTicket) => {
  const newTicket = new OrderTicketModel(orderTicket);
  try {
    return await newTicket.save();
  } catch (err) {
    throw new Error(err);
  }
};

const getFirstOrder = async (booking_id) => {
  try {
    return await OrderTicketModel.findOne({ booking_id });
  } catch (err) {
    throw new Error(err);
  }
};

const updateStatus = async (orderTicket_id, status) => {
  try {
    return await OrderTicketModel.updateOne(
      { _id: orderTicket_id },
      { status: status }
    );
  } catch (err) {
    throw new Error(err);
  }
};

const getListByBooking = async (booking_id) => {
  try {
    let filter = {
      booking_id: booking_id,
    };
    return await OrderTicketModel.find(filter).sort({}).maxTimeMS(1000);
  } catch (err) {
    throw new Error(err);
  }
};

const updateAllStatus = async (booking_id, status) => {
  try {
    return await OrderTicketModel.updateMany(
      { booking_id: booking_id },
      { status: status }
    );
  } catch (err) {
    throw new Error(err);
  }
};

const updatePrice = async (_id, price) => {
  try {
    return await OrderTicketModel.updateOne(
      { _id: _id },
      { price: price }
    );
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  getOrderList,
  setOrderTicket,
  getFirstOrder,
  updateStatus,
  getListByBooking,
  getOrderListById,
  updateAllStatus,
  updatePrice
};
