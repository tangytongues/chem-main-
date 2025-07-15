// Vercel serverless function
import { createServer } from "http";
import express from "express";

// Import your existing server code
import { registerRoutes } from "../server/routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up routes
const server = await registerRoutes(app);

// Export the Express app as a Vercel function
export default app;
