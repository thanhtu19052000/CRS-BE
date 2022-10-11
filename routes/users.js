const express = require("express");
const router = express.Router();
const userService = require("../services/userService");
const bcrypt = require("bcryptjs");
const { UserModel } = require("../models/user");

// var storage = multer.diskStorage({
//     destination: function(req, file, cb){
//         cb(null, './upload')
//     },
//     filename:
// })

//Getting one
router.post("/getUser/:_id", getUser, (req, res) => {
  if (res.user != null) res.json(res.user);
});

router.post("/getUserList/", async (req, res) => {
  try {
    const listUsers = await userService.getUserList(req.body.role);

    console.info("[INFO] Get list of users");
    res.status(201).json(listUsers);
  } catch (err) {
    console.error("[ERROR] userAPI/getAllUsers [Detail]", err);
    res.status(500).json("ERROR!!!");
  }
});

router.post("/getAllUserList/", async (req, res) => {
  try {
    const listUsers = await userService.getUserList("driver");
    const listDrivers = await userService.getUserList("user");
    const listAll = listDrivers.concat(listUsers);

    console.info("[INFO] Get list of users");
    res.status(201).json(listAll);
  } catch (err) {
    console.error("[ERROR] userAPI/getAllUsers [Detail]", err);
    res.status(500).json("ERROR!!!");
  }
});

//Add
router.post("/setUser/", async (req, res) => {
  const user = {
    name: req.body.name.trim(),
    email: req.body.email.trim(),
    password: "",
    address: req.body.address.trim(),
    phoneNumber: req.body.phoneNumber.trim(),
    birthDay: req.body.birthDay.trim(),
    avatar: req.body.avatar.trim(),
    authInfo: req.body.authInfo.trim(),
    verified: req.body.verified,
  };
  try {
    const saltRounds = await bcrypt.genSalt(10);
    let hashPassword = await bcrypt.hash(req.body.password.trim(), saltRounds);
    user.password = hashPassword;

    const newUser = await userService.setUser(user);

    console.info("[INFO] Add new user: ", user.name);
    res.status(201).json(newUser);
  } catch (err) {
    console.error("[ERROR] userAPI/setUser [Detail]", err);
    res.status(200).json("ERROR!!!");
  }
});

router.post("/activeDriver/", async (req, res) => {
  try {
    const updateDriver = await userService.updateVerified(
      req.body.userId,
      "success"
    );
    res.status(202).json(updateDriver);
  } catch (err) {
    console.error("[ERROR] [Detail]", err);
    res.status(200).send("ERROR!!!");
  }
});

router.post("/diableDriver/", async (req, res) => {
  try {
    const updateDriver = await userService.updateVerified(
      req.body.userId,
      "fail"
    );
    res.status(202).json(updateDriver);
  } catch (err) {
    console.error("[ERROR] [Detail]", err);
    res.status(200).send("ERROR!!!");
  }
});

router.post("/status/", async (req, res) => {
  try {
    const updateUser = await userService.updateUserById(
      req.body.id,
      req.body.lockFlag
    );
    res.status(202).json(updateUser);
  } catch (err) {
    console.error("[ERROR] [Detail]", err);
    res.status(200).send("ERROR!!!");
  }
});

//Updating one
router.post("/update/:_id", getUser, async (req, res) => {
  if (req.body.name != null) {
    res.user.name = req.body.name;
    res.user.age = req.body.age;
    res.user.address = req.body.address;
    res.user.gender = req.body.gender;

    const updateUser = await userService.updateUser(res.user);
    console.info("[INFO] Update user: ", updateUser.name);
    res.status(202).json(updateUser);
  } else {
    res.status(200).send("ERROR!!!");
  }
});

router.post("/edit/", async (req, res) => {
  let user = req.body;
  try {
    const newUser = await userService.editLoad(
      user._id,
      user.avatar,
      user.name,
      user.phoneNumber
    );

    console.info("[INFO] edit user success");
    res.status(201).json({ newUser });
  } catch (err) {
    console.error("[ERROR]", err);
    res.status(200).send("ERROR!!!");
  }
});

//Deleting one
router.post("/delete/:_id", getUser, async (req, res) => {
  if (res.user != null) {
    await userService.deleteUser(res.user);
    console.info("[INFO] Delete user: ", res.user.name);
    res.status(202).json({ message: "Delete user successful" });
  } else {
    res.status(200).send("ERROR!!!");
  }
});

//middleware example
async function getUser(req, res, next) {
  let user;
  try {
    user = await userService.getUserById(req.params._id);
    if (user == null) {
      res.status(404).json({ message: "Cannot find user" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  res.user = user;
  next();
}

module.exports = router;
