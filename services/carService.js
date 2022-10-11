const { CarModel } = require('../models/car');

const getCarList = async () => {
    try {
        let filter = {};
        return await CarModel.find(filter).sort({'name': 1}).maxTimeMS(1000);
    } catch (err) {
        throw new Error(err);
    }
}

const setCar = async (car) => {
    const newCar = new CarModel(car);
    try {
        return await newCar.save();
    } catch (err) {
        throw new Error(err);
    }
}

const getCarById = async (id) => {
    try {
        const car = await CarModel.findById(id);
        if (car == null) {
            return null;
        }
        return car;
    } catch (err) {
        throw new Error(err);
    }
}
const deleteCar = async (car) => {
    try {
        return await car.remove();
    } catch (err) {
        throw new Error(err);
    }
} 

const getCarRiderId = async (id) => {
    try {
        const car = await CarModel.findOne({branch_id: id});
        if (car === null) {
            return null;
        }
        return car;
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = {
    getCarList,
    setCar,
    getCarById,
    deleteCar,
    getCarRiderId
}