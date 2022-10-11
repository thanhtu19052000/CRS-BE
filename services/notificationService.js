const { NotificationModel } = require("../models/notification");

// const getLocationByProvince = async (province) => {
//     try {
//         let filter = {'province': { $regex: province }};
//         return await LocationModel.find(filter).sort({}).maxTimeMS(1000);
//     } catch (err) {
//         throw new Error(err);
//     }
// }

const getNotificationById = async (userId) => {
  try {
    let filter = { userId: userId };
    return await NotificationModel.find(filter).sort({ createdAt: -1 });
  } catch (err) {
    throw new Error(err);
  }
};

const createNotification = async (notification) => {
  const newNotification = new NotificationModel(notification);
  try {
    return await newNotification.save();
  } catch (err) {
    throw new Error(err);
  }
};

// const setLocation = async (location) => {
//     const newLocation = new LocationModel(location);
//     try {
//         return await newLocation.save();
//     } catch (err) {
//         throw new Error(err);
//     }
// }

module.exports = {
  // getLocationByProvince,
  // setLocation
  getNotificationById,
  createNotification,
};
