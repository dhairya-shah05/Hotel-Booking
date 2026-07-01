import Hotel from "../models/hotel.js";
import User from "../models/User.js";
import connectDB from "../configs/db.js";

export const registerHotel = async(req, res)=> {
    try {
        await connectDB()
        const {name, address, contact, city} = req.body;
        const owner = req.user._id

        // Check if User Already Registered
        const hotel = await Hotel.findOne({owner})
        if(hotel) {
            return res.json({success: false, message: "Hotel Already Registered"})
        }

        await Hotel.create({name, address, contact, city, owner});
        await User.findByIdAndUpdate(owner, {role: "hotel-owner"});

        res.json({success: true, message: "Hotel Registered Successfully"})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}