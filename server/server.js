import express from "express"
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebHooks from "./controllers/clerkWebHooks.js";

connectDB()

const app = express ()
app.use(cors()) //Enable cross-origin resource sharing

// Middleware
app.use(express.json())
app.use(clerkMiddleware())

app.use("/api/clerk", clerkWebHooks);

app.get('/', (req, res) => res.send("API is working fine"))

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));