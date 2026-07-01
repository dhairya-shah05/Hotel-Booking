import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(`${process.env.MONGODB_URI}`, {
            bufferCommands: false,
        }).then((mongoose) => {
            console.log("Database Connected");
            return mongoose;
        }).catch((err) => {
            cached.promise = null; // ✅ reset so it retries next call
            throw err;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectDB;
