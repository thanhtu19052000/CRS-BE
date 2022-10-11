const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");

const mongodb = require("./common/mongoDB/mongoConnect");
mongodb.connectMongoDB();

app.use(
  cors({
    origin: "*",
  })
);

const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(express.json());

const authenticateService = require("./routes/authenticate");
app.use("/api/authenticate/", authenticateService);

const verifyService = require("./routes/verifyOTP");
app.use("/api/verify/", verifyService);

const bookingService = require("./routes/booking");
app.use("/api/booking/", bookingService);

const carService = require("./routes/cars");
app.use("/api/cars", carService);

app.use(authenticateToken);

const orderTicketService = require("./routes/orderTicket");
app.use("/api/orderTicket", orderTicketService);

const userService = require("./routes/users");
app.use("/api/users", userService);

const { JWT_CONFIG } = require("./common/constants");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res.status(401).json({
      status: "FAILED",
      message: "Unauthorized!",
    });

  jwt.verify(token, JWT_CONFIG.TOKEN_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.listen(5000, () => {
  console.log("Server is running at port 5000");
});
