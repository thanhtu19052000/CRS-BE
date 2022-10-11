const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    title: {
      type: String,
    },
    type_noti: {
      type: String,
    },
    date: {
      type: String,
    },
    avatar: {
      type: String,
      default:
        "https://winaero.com/blog/wp-content/uploads/2017/02/Settings-Gear-icon.png",
    },
    content: {
      type: String,
    },
    userId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const NotificationModel = mongoose.model("notifications", notificationSchema);

module.exports = { NotificationModel };
