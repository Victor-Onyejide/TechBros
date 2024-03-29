const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const userExists = await User.findOne({ email: req.body.email });
        if (userExists) {
            return res.status(200).json({ message: "User already exists", success: false });
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;

        // create new user
        const newUser = new User(req.body);
        await newUser.save();
        res.json({
            message: "user created successfully",
            success: true,
            user: newUser
        })
    }
    catch (error) {
        res.status(500).send({
            message: error.message,
            data: error,
            success: false,
        });
    }
}

const login = async (req, res) => {

    try {
        // check if user exists
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(200).json({ message: "user does not exist", success: false });
        }

        //check password
        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!validPassword) {
            return res.json({ message: "Invalid password", success: false })
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "User logged in successfully",
            success: true,
            data: token,
            userName: user.name,
        });
    } catch (error) {
        res.status(500).send({
            message: error.message,
            data: error,
            success: false,
        });
    }

}

module.exports = {
    register, login
}