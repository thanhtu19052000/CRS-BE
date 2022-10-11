const express = require('express');
const router = express.Router();
const carService = require('../services/carService');

//testing one
router.post('/getCarList', async (req, res) => {
    try {   
        const listCars = await carService.getCarList();
        console.info("[INFO] cars/getCarList success.");
        res.status(201).json(listCars);
    } catch (err) {
        console.error("[ERROR] cars/getCarList [Detail]", err);
        res.status(500).json("ERROR!!!");
    }
});

router.post('/setCar/', async (req, res) => {
    const car = {
        car_name: req.body.car_name,
        car_type_name: req.body.car_type_id,
        branch_id: req.body.branch_id,
        branch_name: req.body.branch_name,
        total_seat: req.body.total_seat
    };
    try {   
        await carService.setCar(car);
        res.status(201).json({
            status: "success"
        });
    } catch (err) {
        console.error("[ERROR] cars/setCar [Detail]", err);
        res.status(200).json("ERROR!!!");
    }
});

//Updating one
router.patch('/', (req, res) => {
    
});

//Deleting one
router.post('/delete/:_id', getCar, async (req, res) => {
    if (res.car != null) {
        await carService.deleteCar(res.car);
        console.info("[INFO] Delete car: ", res.car.car_name);
        res.status(202).json({ message: 'Delete user successful' });
    } else {
        res.status(200).send('ERROR!!!')
    }
});

//middleware example
async function getCar(req, res, next) {
    let car;
    try {
        car = await carService.getCarById(req.params._id);
        if (car == null) {
            res.status(404).json({ message: 'Cannot find user' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    res.car = car;
    next();
}


module.exports = router;