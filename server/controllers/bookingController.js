import transporter from "../configs/nodemailer.js";
import Booking from "../models/booking.js"
import Hotel from "../models/hotel.js";
import Room from "../models/room.js"
import connectDB from "../configs/db.js";
import Stripe from "stripe";

// Fucntion to check availability of a room
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {

    try {
        await connectDB()
        const bookings = await Booking.find({
            room,
            checkInDate: { $lte: checkOutDate },
            checkOutDate: { $gte: checkInDate },
        })
        const isAvailable = bookings.length === 0;
        return isAvailable;
    } catch (error) {
        console.log(error.message);
    }
}

// API to check availability of a room
// POST /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        res.json({ success: true, isAvailable })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// API to create a new booking
// POST /api/bookings/book

// export const createBooking = async (req, res) => {
//     try {
//         await connectDB()
//         const { room, checkInDate, checkOutDate, guests } = req.body;
//         const user = req.user._id;

//         // Before Booking Check Availability
//         const isAvailable = await checkAvailability({
//             checkInDate,
//             checkOutDate,
//             room
//         });

//         if (!isAvailable) {
//             return res.json({ success: false, message: "Room is not available" })
//         }

//         const roomData = await Room.findById(room).populate("hotel");
//         let totalPrice = roomData.pricePerNight;

//         // Calculate total Price based on nights
//         const checkIn = new Date(checkInDate)
//         const checkOut = new Date(checkOutDate)
//         const timeDiff = checkOut.getTime() - checkIn.getTime();
//         const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

//         totalPrice *= nights;
//         const booking = await Booking.create({
//             user,
//             room, hotel: roomData.hotel._id,
//             guests: +guests,
//             checkInDate,
//             checkOutDate,
//             totalPrice,
//         })

//         const mailOptions = {
//             from: process.env.SENDER_EMAIL,
//             to: req.user.email,
//             subject: 'Hotel Booking Details',
//             html: `
//                 <h2>Your Booking Details</h2>
//                 <p>Dear ${req.user.username},</p>
//                 <p>Thank you for your booking! Here are your details:</p>
//                 <ul>
//                     <li><strong>Booking ID:</strong> ${booking._id}</li>
//                     <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
//                     <li><strong>Location:</strong> ${roomData.hotel.address}</li>
//                     <li><strong>Date:</strong> ${booking.checkInDate.toDateString()}</li>
//                     <li><strong>Booking Amount:</strong> ${process.env.CURRENCY || '$'} 
//                         ${booking.totalPrice}
//                     </li>
//                     <li><strong>Booking ID:</strong> ${booking._id}</li>
//                 </ul>
//                 <p>We look forward to welcoming you!</p>
//                 <p>If you need to make any changes, feel free to contact us.</p>
//             `
//         }

//         console.log("Booking created, sending email to:", req.user);

//         try {
//             await transporter.sendMail(mailOptions)
//             console.log("Email sent:", info);
//         } catch (emailError) {
//             console.error("Email failed:", emailError);
//         }

//         res.json({ success: true, message: "Booking created successfully" })
//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: "Failed to create booking" })
//     }
// };

export const createBooking = async (req, res) => {
    try {
        await connectDB();
        const { room, checkInDate, checkOutDate, guests } = req.body;
        const user = req.user._id;

        // Before Booking Check Availability
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        if (!isAvailable) {
            return res.json({ success: false, message: "Room is not available" });
        }

        const roomData = await Room.findById(room).populate("hotel");
        let totalPrice = roomData.pricePerNight;

        // Calculate total Price based on nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        totalPrice *= nights;

        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: req.user.email,
            subject: "Hotel Booking Details",
            html: `
        Dear ${req.user.username},

        Thank you for your booking! Here are your details:

        Hotel: ${roomData.hotel.name}
        City: ${roomData.hotel.city}
        Room Type: ${roomData.roomType}
        Check-in: ${checkIn.toDateString()}
        Check-out: ${checkOut.toDateString()}
        Guests: ${guests}
        Total Price: ${totalPrice}

        We look forward to welcoming you!

        If you need to make any changes, feel free to contact us.
      `,
        };

        try {
            const info = await transporter.sendMail(mailOptions);
        } catch (emailError) {
        }

        res.json({ success: true, message: "Booking created successfully" });
    } catch (error) {
        console.error("createBooking: error", error);
        res.json({ success: false, message: "Failed to create booking" });
    }
};

// API to get all bookings for a user
// GET /api/bookings/user
export const getUserBookings = async (req, res) => {

    try {
        await connectDB()
        const user = req.user._id;
        const bookings = await Booking.find({ user })
            .populate("room hotel")
            .sort({ createdAt: -1 }) //  Mongoose .sort() chained on query
        res.json({ success: true, bookings })
    } catch (error) {
        res.json({ success: false, message: "Failed to fetch bookings" })
    }
}

export const getHotelBookings = async (req, res) => {
    try {
        await connectDB()
        const hotel = await Hotel.findOne({ owner: req.user._id });
        if (!hotel) {
            return res.json({ success: false, message: "No Hotel Found" });
        }
        const bookings = await Booking.find({ hotel: hotel._id })
            .populate("room hotel user")
            .sort({ createdAt: -1 });
        // Total Bookings
        const totalBookings = bookings.length;
        // Total Revenue
        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0)
        res.json({ success: true, dashboardData: { totalBookings, totalRevenue, bookings } })
    } catch (error) {
        console.log("getHotelBookings ERROR:", error); // 👈 add this
        res.json({ success: false, message: error.message })
    }
}

export const stripePayment = async(req, res)=> {
    try {
        const {bookingId} = req.body;
        const booking = await Booking.findById(bookingId);
        const roomData = await Room.findById(booking.room).populate('hotel');
        const totalPrice = booking.totalPrice;
        const {origin} = req.headers;

        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
        const line_items = [{
            price_data: {
                currency: "aud",
                product_data: {
                    name: roomData.hotel.name,
                },
                unit_amount: totalPrice * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            metadata: {
                bookingId,
            }
        })
        res.json({success: true, url: session.url})

    } catch (error) {
        console.log("Waiting for payment...", data);
        
        res.json({success: false, message: "Payment Failed"})
    }
}