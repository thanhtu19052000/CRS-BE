const { UserModel } = require('../models/user');


const getUserList = async (role) => {
    try {
        let filter = {
            'authInfo': role
        };
        const userList = await UserModel.find(filter).sort({'name': 1}).maxTimeMS(1000);
        return userList;
    } catch (err) {
        throw new Error(err);
    }
}

const setUser = async (user) => {
    const newUser = new UserModel(user);
    try {
        return await newUser.save();
    } catch (err) {
        throw new Error(err);
    }
}

const getUserById = async (id) => {
    try {
        const user = await UserModel.findById(id);
        if (user == null) {
            return null;
        }
        return user;
    } catch (err) {
        throw new Error(err);
    }
}

const updateUserById = async (id, value) => {
    try {
        return await UserModel.updateOne({ _id: id }, { lockFlag: value });
    } catch (err) {
        throw new Error(err);
    }
}

const deleteUser = async (user) => {
    try {
        return await user.remove();
    } catch (err) {
        throw new Error(err);
    }
}

const updateUser = async (user) => {
    try {
        return await user.save();
    } catch (err) {
        throw new Error(err);
    }
}

const getUserByEmail = async (email) => {
    try {
        return await UserModel.findOne({ email });
    } catch (err) {
        throw new Error(err);
    }
}

const updateVerified = async (userId, isAccept) => {
    try {
        return await UserModel.updateOne({ _id: userId }, { verified: true, isAccept: isAccept});
    } catch (err) {
        throw new Error(err);
    }
}

const updateCar = async (userId, car_id) => {
    try {
        return await UserModel.updateOne({ _id: userId }, { car_id: car_id });
    } catch (err) {
        throw new Error(err);
    }
}


const editLoad = async (id, avatar, name, number ) => {
    try {
        return await UserModel.updateOne({ _id: id }, { name: name, phoneNumber: number, avatar: avatar});
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = {
    getUserList,
    setUser,
    getUserById,
    deleteUser,
    updateUser,
    getUserByEmail,
    updateVerified,
    updateCar,
    updateUserById,
    editLoad,
}