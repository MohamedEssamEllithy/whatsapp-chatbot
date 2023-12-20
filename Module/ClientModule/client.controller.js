import QRCode from "qrcode";
import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
import fs from "fs";
import replyModel from "../../Database/Schema/replySchema.js";
import clientModel from "../../Database/Schema/clientSchema.js";
import * as ChromeLauncher from "chrome-launcher";

const { Client, LocalAuth, MessageMedia } = pkg;
let qrCode;
const users = {};
const userMap = {};
const lastMsg = [];
let executablePath;
async function createClient(req, res) {
  const { id } = req.body;
  // executablePath = ChromeLauncher.getChromePath();
  let client = await clientModel.findOne({ userId: id });

  if (!client) {
    client = await clientModel.findOne({ userId: id });
    clientModel.insertMany([{ userId: id, isLoggedIn: false }]);
  }
  console.log(client);
  users[id] = new Client({
    // puppeteer: {
    //   executablePath: executablePath,
    // },
    headless: true,
    authStrategy: new LocalAuth({ clientId: id }),
  });

  users[id].on("qr", (qr) => {
    qrCode = qr;
    qrcode.generate(qr, { small: true });
    res.json({ msg: "Client Created" });
  });

  users[id].on("ready", () => {
    login(id);
    console.log(`${id}'s Whatsapp Paired!`);
  });

  const msg = await replyModel.findOne({ message: "early bird", userId: id });

  users[id].on("message", (message) => {
    const clientID = message.from;
    if (!userMap[clientID]) {
      userMap[clientID] = true;
      if (msg) {
        users[id].sendMessage(clientID, msg.reply);
      } else {
        users[id].sendMessage(
          clientID,
          "Hello! This is your first message. How can I assist you?"
        );
      }
      return;
    }

    handleMessage(message, users[id], id);
  });

  users[id].on("disconnected", () => {
    console.log(`${id}'s Whatsapp disconnect!`);
    logout(id);
  });

  users[id].initialize();
}

async function restoreSessions() {
  // executablePath = ChromeLauncher.getChromePath();
  let clients = await clientModel.find({ isLoggedIn: true });
  clients.forEach((client) => {
    console.log(client);
    users[client.userId] = new Client({
      // puppeteer: {
      //   executablePath: executablePath,
      // },
      headless: true,
      authStrategy: new LocalAuth({ clientId: client.userId }),
    });

    users[client.userId].on("ready", () => {
      console.log(`${client.userId} Whatsapp Paired!`);
    });

    users[client.userId].on("message", async (message) => {
      const msg = await replyModel.findOne({
        message: "early bird",
        userId: client.userId,
      });
      const clientID = message.from;
      if (!userMap[clientID]) {
        userMap[clientID] = true;
        if (msg) {
          users[client.userId].sendMessage(clientID, msg.reply);
        } else {
          users[client.userId].sendMessage(
            clientID,
            "Hello! This is your first message. How can I assist you?"
          );
        }
        return;
      }

      handleMessage(message, users[client.userId], client.userId);
    });

    users[client.userId].on("disconnected", () => {
      console.log(`${client.userId}'s Whatsapp disconnect!`);
      logout(client.userId);
    });

    users[client.userId].initialize();
  });
}

async function displayQR(req, res) {
  console.log("QR");
  const qrImage = await QRCode.toBuffer(qrCode, { type: "png" });
  res.setHeader("Content-Type", "image/png");
  res.send(qrImage);
}

async function handleMessage(message, usersID, id) {
  const msg = await replyModel.findOne({
    message: message.body.toLowerCase(),
    userId: id,
  });
  const PDFRegex = /\.PDF$/i;
  const imageRegex =
    /\.(PNG|JPEG|JPG|GIF|TIFF|TIF|BMP|SVG|WEBP|ICO|RAW|PSD|EPS|AI)$/i;
  const VideoRegex = /\.(MP4|AVI|MKV|WMV|MOV|FLV|MPEG|WEBM|OGV|MPG)$/i;
  if (msg) {
    if (PDFRegex.test(msg.reply)) {
      const dataBuffer = fs.readFileSync(`./media/${msg.reply}`);
      const base64PDF = dataBuffer.toString("base64");
      const media = new MessageMedia("application/pdf", base64PDF);
      usersID.sendMessage(message.from, media);
    } else if (imageRegex.test(msg.reply)) {
      const dataBuffer = fs.readFileSync(`./media/${msg.reply}`);
      const base64Image = dataBuffer.toString("base64");
      const media = new MessageMedia(
        `image/${msg.reply.slice(msg.reply.lastIndexOf("."))}`,
        base64Image
      );
      usersID.sendMessage(message.from, media);
    } else if (VideoRegex.test(msg.reply)) {
      const dataBuffer = fs.readFileSync(`./media/${msg.reply}`);
      const base64video = dataBuffer.toString("base64");
      const media = new MessageMedia(
        `video/${msg.reply.slice(msg.reply.lastIndexOf("."))}`,
        base64video
      );
      usersID.sendMessage(message.from, media);
    } else {
      message.reply(msg.reply);
    }
  } else {
    const flag = lastMsg.find((e) => e == message.from);
    if (!flag) {
      lastMsg.push(message.from);
      const LateOwl = await replyModel.findOne({
        message: "late owl",
        userId: id,
      });
      if (LateOwl) {
        usersID.sendMessage(message.from, LateOwl.reply);
      } else {
        usersID.sendMessage(message.from, "please, choose option form list");
      }
    }
  }
}

async function logout(id) {
  const user = await clientModel.findOneAndUpdate(
    { userId: id },
    { isLoggedIn: false },
    { new: true }
  );
  console.log(user);
}
async function login(id) {
  const user = await clientModel.findOneAndUpdate(
    { userId: id },
    { isLoggedIn: true },
    { new: true }
  );
  console.log(user);
}

export { createClient, displayQR, restoreSessions };
