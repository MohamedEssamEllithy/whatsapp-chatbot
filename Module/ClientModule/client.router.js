import express from "express";
import { createClient, displayQR } from "./client.controller.js";

const clientRouter = express.Router();

clientRouter.get("/", displayQR);
clientRouter.post("/newClient", createClient);

export { clientRouter };
