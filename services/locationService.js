const { LocationModel } = require('../models/location');

const getLocationByProvince = async (province) => {
    try {
        let filter = {'province': { $regex: province }};
        return await LocationModel.find(filter).sort({}).maxTimeMS(1000);
    } catch (err) {
        throw new Error(err);
    }
}

const setLocation = async (location) => {
    const newLocation = new LocationModel(location);
    try {
        return await newLocation.save();
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = {
    getLocationByProvince,
    setLocation
}