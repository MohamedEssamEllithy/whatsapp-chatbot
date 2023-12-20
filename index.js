import express from "express";
import connect from "./Database/connection.js";
import cors from "cors";
import { clientRouter } from "./Module/ClientModule/client.router.js";
import { restoreSessions } from "./Module/ClientModule/client.controller.js";
import { replyRouter } from "./Module/replyModule/reply.route.js";

const server = express();

server.use(express.json());
server.use(cors());

server.use(clientRouter);
server.use(replyRouter);

connect();

restoreSessions();

server.listen(process.env.PORT || 8000, () => {
  console.log("Server Started");
});
