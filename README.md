# QuickStay – Hotel Booking Platform

A full-stack MERN hotel booking application with real-world features like secure authentication, room search and filtering, booking management, owner dashboard, Stripe payments, and email booking confirmations.

## Features

- **User authentication** with Clerk (sign in, sign up, secure sessions).
- **Homepage** with hero, testimonials, and featured destinations to explore hotels.
- **Advanced room search & filters** by destination, room type, price range, and sort options.
- **Room details page** with photos, amenities, pricing, and booking form.
- **Booking system** that calculates total price based on number of nights and guests.
- **My Bookings page** where users can view their past and upcoming reservations.
- **Stripe Checkout integration** for online payment of bookings.
- **Email confirmations** using Nodemailer that send booking details to the user.
- **Hotel owner dashboard** with stats and lists of bookings.

## Tech Stack

### Frontend

- React + Vite
- React Router
- Clerk React
- Tailwind-style utility classes
- Axios
- Custom `AppContext` for global state (rooms, user, currency, navigation, owner flags)

### Backend

- Node.js + Express
- MongoDB + Mongoose (User, Hotel, Room, Booking models)
- Stripe Checkout (`checkout.sessions.create`)
- Nodemailer for transactional emails
- Auth middleware (Clerk/JWT) to protect routes and populate `req.user`

## Core Modules

### Client

- `src/App.jsx` – main router and layout (user vs owner pages).
- `src/context/AppContext.jsx` – global context for app state.
- `src/pages/Home.jsx` – landing page.
- `src/pages/AllRooms.jsx` – list + filters for all rooms.
- `src/pages/RoomDetails.jsx` – single room details + booking form.
- `src/pages/MyBookings.jsx` – user bookings list + “Pay Now” (Stripe).
- `src/pages/hotelOwner/*` – owner layout, dashboard, add-room, list-room.
- `src/components/*` – Navbar, Footer, Hero, HotelCard, Testimonials, Loader, etc.

### Server

- `server/controllers/bookingController.js`
  - `checkAvailabilityAPI` – checks if a room is available for selected dates.
  - `createBooking` – creates a booking, calculates total price, sends email.
  - `getUserBookings` – bookings for logged-in user.
  - `getHotelBookings` – bookings + metrics for hotel owner.
  - `stripePayment` – creates Stripe Checkout session and returns redirect URL.
- `server/routes/bookingRoutes.js` – mounts `/api/bookings` routes.

## Environment Variables

### Client (`client/.env`)

- `VITE_CLERK_PUBLISHABLE_KEY` – Clerk public key.
- `VITE_BACKEND_URL` – backend API base URL (e.g. `http://localhost:5000`).
- `VITE_CURRENCY` – currency symbol (e.g. `$`, `₹`).

### Server (`server/.env`)

- `MONGODB_URI` – MongoDB connection string.
- `STRIPE_SECRET_KEY` – Stripe secret key.
- `SENDER_EMAIL` – email address for sending booking confirmations.
- Any Clerk/JWT-related secrets used by auth middleware.

## Running Locally

### 1. Clone repo

```bash
git clone https://github.com/dhairya-shah05/Hotel-Booking.git
cd Hotel-Booking
```

### 2. Install dependencies

```bash
cd client
npm install
cd ../server
npm install
```

### 3. Configure env

Create `client/.env` and `server/.env` with the variables listed above.

### 4. Start backend

From `server`:

```bash
npm run dev