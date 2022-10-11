const express = require("express");
const router = express.Router();
const bookingService = require("../services/bookingService");
const locationService = require("../services/locationService");
const chartService = require("../services/seatingChartService");
const carService = require("../services/carService");
const orderTicketService = require("../services/orderTicketService");
const getListByBooking = require("../services/orderTicketService");
const userService = require("../services/userService");
const mailUtil = require("../common/mailUtil");
const {
  getNotificationById,
  createNotification,
} = require("../services/notificationService");
const moment = require("moment/moment");

router.post("/getBookingList", async (req, res) => {
  let booking_type = req.body.booking_type;
  let start_location = req.body.start_location;
  let end_location = req.body.end_location;
  let date = req.body.date;

  try {
    let toDay = new Date();
    let endTime = new Date(date);

    let startDate = new Date(date);

    if (toDay.getDate() === startDate.getDate()) {
      endTime.setHours(23, 59, 59);
    } else {
      startDate.setHours(00, 00, 00);
      endTime.setHours(23, 59, 59);
    }

    startDate.setHours(startDate.getHours() + 7);
    endTime.setHours(endTime.getHours() + 7);

    let listBooking = [];
    if (booking_type === "by-line") {
      listBooking = await bookingService.getBookingByLineList(
        start_location,
        end_location,
        startDate,
        endTime
      );
    } else {
      let listBooking1 = await bookingService.getBookingByHomeList1(
        getCity(start_location.name),
        getCity(end_location.name),
        startDate,
        endTime
      );
      let listBooking2 = await bookingService.getBookingByHomeList2(
        start_location.coordinates.lat,
        end_location.coordinates.lat,
        startDate,
        endTime
      );
      list = listBooking1;
      listBooking2.map((item) => {
        let check = true;
        for (let i = 0; i < listBooking1.length; i++) {
          if (item.car_id === listBooking1[i].car_id) {
            check = false;
            break;
          }
        }
        if (check) list.push(item);
      });

      listBooking = list;
      // listBooking3.map((item) => {
      //     let check = true;
      //     for(let i=0; i<list.length; i++) {
      //         if (item.car_id === list[i].car_id) {
      //             check = false;
      //             break;
      //         }
      //     }
      //     if (check) listBooking.push(item);
      // });
    }

    let data = [];
        if (listBooking.length !== 0) {
            Promise.all(
                listBooking.map(async booking => {
                    const carInfo = await carService.getCarById(booking.car_id);
                    const listSeat = await chartService.getByBooking(booking._id, booking.car_id, startDate.toISOString().split('T')[0]);
                    const OrderList = await orderTicketService.getListByBooking(booking._id);
                    let distanceList = [];
            
                    let listLocation = [];

                    if (OrderList.length !== 0) {
                        OrderList.forEach(order => {
                            let object = {
                                userId: order.user_id,
                                seat: order.seats.length,
                                distance: order.distance
                            }
                            distanceList.push(object);
                        });
                    }
    
                    let seatChart = [];
                    let occupied = [0];
                    let selected = [];
                    listSeat.forEach(seat => {
                        let object = {
                            name: seat.seat_name,
                            key: seat.key
                        }
                        seatChart.push(object);
    
                        if (seat.filled) {
                            occupied.push(seat.key);
                        }
                    });
    
                    let bookingInfo = {
                        id: booking._id,
                        car_id: booking.car_id,
                        pickup_location: booking.start_location_name,
                        destination: booking.end_location_name,
                        avatar: booking.avatar,
                        status: booking.status,
                        name_car: carInfo.car_name,
                        name_company: carInfo.branch_name,
                        car_type: carInfo.car_type_name,
                        car_type_id: 'car' + carInfo.total_seat,
                        time_start: booking.start_time,
                        time_end: booking.end_time,
                        price: booking.price,
                        list_location: listLocation,
                        seat: {
                            seats: seatChart,
                            occupied: occupied,
                            selected: selected,
                        },
                        distanceList: distanceList
                    }
          data.push(bookingInfo);
        })
      ).then(() => {
        return res.status(201).json({
          status: "SUCCESS",
          data,
        });
      });
    } else {
      return res.status(201).json({
        status: "FAILED",
        data,
      });
    }
  } catch (err) {
    console.error("[ERROR] booking/getBookingList [Detail]", err);
    res.status(500).json({
      status: "FAILED",
      message: "ERROR!!!",
    });
  }
});

router.post("/setBooking", async (req, res) => {
  const booking = req.body.booking;
  const order = req.body.order;

  try {
    const createBooking = await bookingService.setBooking(booking);

    if (createBooking) {
      order.booking_id = createBooking._id;
      await orderTicketService.setOrderTicket(order);

      console.info("[INFO] set booking success!");
      res.status(201).json({
        status: "success",
      });
    } else {
      console.info("[INFO] set booking failed!");
      res.status(201).json({
        status: "failed",
      });
    }
  } catch (err) {
    console.error("[ERROR] booking/setBooking [Detail]", err);
    res.status(500).json("ERROR!!!");
  }
});

router.post("/getRequestBooking", async (req, res) => {
  let start_location = req.body.start_location;
  let date = req.body.date;
  let userId = req.body.userId;

  try {
    let toDay = new Date();
    let endTime = new Date(date);

    let startDate = new Date(date);

    if (toDay.getDate() === startDate.getDate()) {
      endTime.setHours(23, 59, 59);
    } else {
      startDate.setHours(00, 00, 00);
      endTime.setHours(23, 59, 59);
    }

    startDate.setHours(startDate.getHours() + 7);
    endTime.setHours(endTime.getHours() + 7);

    // console.log(startDate, '-----', endTime);

    const carInfo = await carService.getCarRiderId(userId);

    const listRequest = await bookingService.getRequestBooking(
      start_location,
      startDate,
      endTime,
      carInfo.total_seat
    );

    if (listRequest.length !== 0) {
      let index = 0;

      if (listRequest.length !== 1) {
        index = Math.floor(Math.random() * listRequest.length);
      }

      const firstOrder = await orderTicketService.getFirstOrder(
        listRequest[index]._id
      );

      const data = {
        booking_id: listRequest[index]._id,
        orderTicket_id: firstOrder._id,
        pickup_name: listRequest[index].start_location_name,
        pickup_address: firstOrder.pick_point_name,
        destination_name: listRequest[index].end_location_name,
        destination_address: firstOrder.drop_point_name,
        price: listRequest[index].price,
        start_time: listRequest[index].start_time,
      };

      console.info("[INFO] get request booking success!");
      res.status(201).json({
        status: "success",
        data: data,
      });
    } else {
      console.info("[INFO] get request booking failed!");
      res.status(201).json({
        status: "failed",
      });
    }
  } catch (err) {
    console.error("[ERROR] booking/getRequestBooking [Detail]", err);
    res.status(500).json("ERROR!!!");
  }
});

router.post("/takeBooking", async (req, res) => {
  const booking_id = req.body.booking_id;
  const orderTicket_id = req.body.orderTicket_id;
  const user_id = req.body.user_id;
  const status = 1;
  const date = req.body.start_time.split("T")[0];
  const time = req.body.start_time.split("T")[1];
  try {
    await orderTicketService.updateStatus(orderTicket_id, status);
    const firstOrder = await orderTicketService.getFirstOrder(booking_id);
    const driver = await userService.getUserById(user_id);
    await bookingService.updateBooking(
      booking_id,
      status,
      driver.car_id,
      driver._id,
      driver.avatar
    );
    const carInfo = await carService.getCarById(driver.car_id);
    const user = await userService.getUserById(firstOrder.user_id);

    let chart = {
      car_id: null,
      booking_id: null,
      date: null,
      seat_name: null,
      key: null,
      filled: null,
    };

    if (carInfo !== null) {
      for (let i = 0; i < carInfo.total_seat; i++) {
        chart.car_id = driver.car_id;
        chart.booking_id = booking_id;
        chart.date = date;
        chart.seat_name =
          i === 0 ? "Driver" : "A" + (i < 10 ? "0" + i : i).toString();
        chart.key = i;
        chart.filled = firstOrder.seats.includes(chart.seat_name)
          ? true
          : false;

        await chartService.setChart(chart);
      }
    }

    const mailContent = `
                <h3>TICKET INFORMATION</h3> 
                <p>Your order has been successfully processed. Here is your ticket information from VASTUM</p>
                <p>Start location: <b>${firstOrder.pick_point_name}</b></p>
                <p>Destination: <b>${firstOrder.drop_point_name}</b></p>
                <p>Start date: <b>${date}</b></p>
                <p>Start time: <b>${time.split(".")[0]}</b></p>
                <p>Best wishes</p>
                <p>From VASTUM team</p>`;
    //send otp to email
    console.info("[INFO] send order mail");
    mailUtil.sendMail(mailContent, user.email, "Ticket information");

    console.info("[INFO] take booking success!");
    res.status(201).json({
      status: "success",
    });
  } catch (err) {
    console.error("[ERROR] booking/takeBooking [Detail]", err);
    res.status(500).json("ERROR!!!");
  }
});

router.post("/orderTicket", async (req, res) => {
  const order = req.body.order;
  const car_id = req.body.car_id;
  const date = req.body.date.split("T")[0];
  const time = req.body.date.split("T")[1];
  const ticket_price = req.body.ticket_price;

  try {
    const newOrderTicket = await orderTicketService.setOrderTicket(order);
    const user = await userService.getUserById(order.user_id);

    if (newOrderTicket._id) {
        const OrderList = await orderTicketService.getListByBooking(order.booking_id);

        let distanceList = [];
        if (OrderList.length !== 0) {
            OrderList.map(order => {
                let object = {
                    seat: order.seats.length,
                    distance: order.distance
                }
                distanceList.push(object);
            });
        }

        // update all tickets price
        let listOrderUpdate = OrderList.filter(item => item.price !== newOrderTicket.price);

        if (listOrderUpdate.length !== 0) {
            listOrderUpdate.map(async order => {
                newPrice = calculatePrice(ticket_price, distanceList, order.seats.length, order.distance);
                await orderTicketService.updatePrice(order._id, newPrice);
            });
        }

        Promise.all(
            order.seats.map(async (seat) => {
            await chartService.updateSeat(order.booking_id, car_id, date, seat);
            })
        ).then(() => {
            const mailContent = `
                    <h3>TICKET INFORMATION</h3> 
                    <p>Your order has been successfully processed. Here is your ticket information from VASTUM</p>
                    <p>Start location: <b>${order.pick_point_name}</b></p>
                    <p>Destination: <b>${order.drop_point_name}</b></p>
                    <p>Start date: <b>${date}</b></p>
                    <p>Start time: <b>${time.split(".")[0]}</b></p>
                    <p>Best wishes</p>
                    <p>From VASTUM team</p>`;
            //send otp to email
            console.info("[INFO] send order mail");
            mailUtil.sendMail(mailContent, user.email, "Ticket information");

            console.info("[INFO] set order ticket success!");
            res.status(201).json({
            status: "success",
            });
        });
    } else {
      console.info("[INFO] set order ticket failed!");
      res.status(201).json({
        status: "failed",
      });
    }
  } catch (err) {
    console.error("[ERROR] booking/orderTicket [Detail]", err);
    res.status(500).json("ERROR!!!");
  }
});

router.post("/getTrip", async (req, res) => {
  const driver_id = req.body.driver_id;
  try {
    const driverInfo = await userService.getUserById(driver_id);
    const booking = await bookingService.getBookingByDriver(driver_id);

    if (booking) {
      let total_seat = 0;
      let data = {
        id: booking._id,
        name_driver: driverInfo.name,
        total_seat: 0,
        total_cost: booking.price,
        status_driver: booking.status,
        time_stop: "",
        address_start: booking.start_location_name,
        time_start: booking.start_time,
        address_stop: booking.end_location_name,
        list_customer: [],
        list_order: [],
      };

      const listOrderTicket = await orderTicketService.getListByBooking(
        booking._id
      );

      if (listOrderTicket.length !== 0) {
        listOrderTicket.forEach((order) => {
          let object = {
            id_customer: order.user_id,
            name_customer: order.user_name,
            amount_customer: order.seats.length,
            phone_number: order.phone_number,
            address_start: order.pick_point_name,
            address_stop: order.drop_point_name,
            pickup: false,
            dropoff: false,
            total: order.price,
          };
          total_seat += order.seats.length;
          data.list_customer.push(object);
        });
      }

      data.total_seat = total_seat;

      console.info("[INFO] get trip success!");
      res.status(201).json({
        status: "success",
        data: data,
      });
    } else {
      console.info("[INFO] get trip success!");
      res.status(201).json({
        status: "failed",
        data: {},
      });
    }
  } catch (err) {
    console.error("[ERROR] booking/getTrip [Detail]", err);
    res.status(500).json("ERROR!!!");
  }
});

router.post("/setLocation", async (req, res) => {
  const location = {
    province: req.body.province,
    location: req.body.location,
  };
  try {
    await locationService.setLocation(location);

    console.info("[INFO] set location success!");
    res.status(201).json({
      status: "success",
    });
  } catch (err) {
    console.error("[ERROR] booking/setLocation [Detail]", err);
    res.status(500).json("ERROR!!!");
  }
});

router.post("/activeTrip", async (req, res) => {
  const rider_id = req.body.driver_id;
  const status = 1;
  const newStatus = 2;
  try {
    const booking = await bookingService.getBookingByDriver(rider_id, status);

    if (booking) {
      await orderTicketService.updateAllStatus(booking._id, newStatus);
    }
    await bookingService.updateBookingStatus(rider_id, status, newStatus);

    console.info("[INFO] active trip success!");
    res.status(201).json({
      status: "success",
    });
  } catch (err) {
    console.error("[ERROR] booking/activeTrip [Detail]", err);
    res.status(500).json("ERROR!!!");
  }
});

router.post("/completeTrip", async (req, res) => {
  const rider_id = req.body.driver_id;
  const status = 2;
  const newStatus = 3;
  try {
    const booking = await bookingService.getBookingByDriver(rider_id, status);

    if (booking) {
      await orderTicketService.updateAllStatus(booking._id, newStatus);
    }

    await bookingService.updateBookingStatus(rider_id, status, newStatus);

    console.info("[INFO] complete trip success!");
    res.status(201).json({
      status: "success",
    });
  } catch (err) {
    console.error("[ERROR] booking/completeTrip [Detail]", err);
    res.status(500).json("ERROR!!!");
  }
});

router.post("/setSeatingChart", async (req, res) => {
  let car_id = req.body.car_id;
  let booking_id = req.body.booking_id;
  let date = req.body.date;

  try {
    let chart = {
      car_id: null,
      booking_id: null,
      date: null,
      seat_name: null,
      key: null,
      filled: null,
    };

    const carInfo = await carService.getCarById(car_id);

    if (carInfo !== null) {
      for (let i = 1; i <= carInfo.total_seat; i++) {
        chart.car_id = car_id;
        chart.booking_id = booking_id;
        chart.date = date;
        chart.seat_name = "A" + (i < 10 ? "0" + i : i).toString();
        chart.key = i;
        chart.filled = false;

        await chartService.setChart(chart);
      }
    }

    console.info("[INFO] set seating chart success!");
    res.status(201).json({
      status: "success",
    });
  } catch (err) {
    console.error("[ERROR] booking/setSeatingChart [Detail]", err);
    res.status(500).json("ERROR!!!");
  }
});

router.post("/getNotification", async (req, res) => {
  try {
    const userId = req.body.userId;
    const listNotification = await getNotificationById(userId);

    res.status(201).json({
      status: "success",
      data: listNotification,
    });
  } catch (err) {
    console.error("[ERROR] booking/getNotification [Detail]", err);
    res.status(500).json("ERROR!!!");
  }
});

router.post("/createNotification", async (req, res) => {
  try {
    //   let chart = {
    //     car_id: null,
    //     booking_id: null,
    //     date: null,
    //     seat_name: null,
    //     key: null,
    //     filled: null,
    //   };
    // typeNoti: "driver-accept" || "price"
    const { bookingId, typeNoti } = req.body;
    if (typeNoti === "price") {
      const listBooking = await orderTicketService.getListByBooking(bookingId);
    //   const listBookingId = listBooking.map((item) => item.user_id);
    //   const listBookingIdFiltered = listBookingId.filter(
    //     (item, pos, self) => self.indexOf(item) == pos
    //   );

    listBooking.map(
        async (booking) =>
          await createNotification({
            date: moment().format("hh:mm DD/MM/YYYY"),
            content: `New price trip from ${booking.pick_point_name} to ${booking.drop_point_name} is ${booking.price}`,
            userId: booking.user_id,
            typeNoti: typeNoti,
            title: "Some one join your trip",
          })
      );
    }
    if (typeNoti === "driver-accept") {
      const listBooking = await orderTicketService.getListByBooking(bookingId);
      await createNotification({
        date: moment().format("hh:mm DD/MM/YYYY"),
        content: `Driver pick your trip from ${listBooking[0].pick_point_name} to ${listBooking[0].drop_point_name}, Have a nice trip`,
        userId: listBooking[0].user_id,
        typeNoti: typeNoti,
        title: `Driver pick your trip`,
      });
    }
    //   console.info("[INFO] set seating chart success!");

    res.status(201).json({
      status: "success",
    });
  } catch (err) {
    console.error("[ERROR] booking/getNotification [Detail]", err);
    res.status(500).json("ERROR!!!");
  }
});

router.post("/getBookingListDriver", async (req, res) => {
  try {
    const rider_id = req.body.rider_id;
    const dataBooking = await bookingService.getAllBookingByDriver(rider_id);

    res.status(201).json({
      data: dataBooking,
      status: "success",
    });
  } catch (err) {
    console.error("[ERROR] booking/getBookingListDriver [Detail]", err);
    res.status(500).json("ERROR!!!");
  }
});

// getLocationByProvince,
// setLocation
router.patch("/", (req, res) => {});

router.delete("/:id", (req, res) => {});

const getCity = (input) => {
  let a = input.split(",");
  return a[a.length - 1].replace(/[0-9]/g, "").trim();
};

const calculatePrice = (price, distanceList, totalSeat, distance) => {
    let sumDistance = 0;

    distanceList.forEach((item) => {
        sumDistance += item.distance * item.seat;
    });

    return Math.floor((price / sumDistance) * distance * totalSeat);
}

module.exports = router;
