const mongoose = require('mongoose');
const { MONGODB_CONFIG } = require('../constants');

const handleMongoDBEvent = () => {
    //event connecting
    mongoose.connection.on("connecting", () => {
        console.log("MongoDB Connecting...");
    });

    //event connected
    // mongoose.connection.on("connected", () => {
    //     console.log("MongoDB Connected");
    // });

    //event connected
    mongoose.connection.once("open", () => {
        console.log("Connected to Database");
    });

    //event disconnected
    mongoose.connection.on("disconnected", () => {
        console.log("MongoDB Disconnected");
        console.log("MongoDB Trying Reconnect...");
        connectMongoDB();
    });

    //event close
    mongoose.connection.on("close", () => {
        console.log("MongoDB Close");
    });

    //event error
    mongoose.connection.on("error", (err) => {
        console.log("MongoDB Error: ", err);
    });
}

//apply
handleMongoDBEvent();

// connect mongoose
const connectMongoDB = async () => {
    return await mongoose.connect(MONGODB_CONFIG.uri, MONGODB_CONFIG.options)
}
module.exports.connectMongoDB = connectMongoDB;