import User from "../models/User.js";
import { getAuth } from "@clerk/express";

export const protect = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);
        console.log("userId:", userId);
        if (!userId) {
            return res.json({ success: false, message: "not authenticated" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}